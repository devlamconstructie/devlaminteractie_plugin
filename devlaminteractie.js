var roughwrappers

document.addEventListener('DOMContentLoaded', (event) => {
    console.log('domcontentloaded')
    decorate_logo_svgs();
    roughwrappers = Array.from(document.querySelectorAll('.rough_wrapper, .__textbutton'))
    write_default_states_css(roughwrappers)
});

window.addEventListener('load', e => {
    decorate_menuitem_hoverstates()
    decorate_hoverstates_by_classname('__textbutton')
    frameImages();
})

window.addEventListener("orientationchange", () =>  on_resize());

window.addEventListener('resize', debounce( on_resize, 50));

async function decorate_menuitem_hoverstates(){
   const options = { fill: '#f5bcbd', fillStyle: 'zigzag', hachureAngle: 50, hachureGap: 7, roughness: 3.5 }
   decorate_hoverstates_by_classname('menu-item', options);
}

async function decorate_hoverstates_by_classname(className, options){
    //insert required css for this thing to work.
    const cssrule = [
        {property: 'min-width', value: 'inherit'},
        {property: 'padding', value: 'inherit'}, 
        {property: 'line-height', value: 'inherit'}, 
        {property: 'background-repeat', value: 'no-repeat'}, 
        {property: 'opacity', value: 0}, 
        {property: 'position', value: 'absolute'}, 
        {property: 'left', value:0}, 
        {property: 'top', value:0}, 
        {property: 'z-index', value:5}, 
        {property: 'width', value:'100%'}, 
        {property: 'height', value: '100%'}, 
        {property: 'transition', value: '.3s'}, 
        {property: 'pointer-events', value: 'none'}
    ] 
    update_css_rule2(`.${className}::before`, cssrule);

    if(className.charAt(0) != '.') className = '.'+className
    className = ( className.charAt(0) == '.' )? className : '.' + className;
    

    options = options || { fill: '#f5bcbd', fillStyle: 'zigzag', hachureAngle: -50, hachureGap: 7, roughness: 3.5 }

    const els = Array.from(document.querySelectorAll(className))
    for (let i = 0; i < els.length; i++ ){
        let id = els[i].id;
        if(!id || typeof id != 'string') els.id = id = className + '_' + i;
        try {
            update_css_rule2(`#${id}::before`, {property: 'content', value: `'${els[i].textContent}'`} )
            update_css_rule2(`#${id}:hover::before`,{property: 'opacity', value: '1'})
            let canvas = await draw_rectangular_canvas(els[i], options);
            await createBgimageCSS(canvas, `#${id}::before`) 
        } catch (error) {
            console.log(error)
        } 
    }
}

function write_background_css_for_className(className =''){
    if(!className)
        return false;

    const coll =  Array.from(document.querySelectorAll(className))
    write_default_states_css(coll)
}

async function write_default_states_css(elements = []){
    let styleNode = getStyleNode()
    for (const el of elements){
        try {
            const options = await get_rough_options(el)
            const canvas = await draw_rectangular_canvas(el, options);
            const selector = (!el.id || typeof el.id == 'undefined') ? create_nthchild_selector('.' + el.classList[0]) : '#' + el.id;
            const url = await createBgimageCSS(canvas, selector) 
        } catch (error) {
            console.log(error)     
        }
    }
}

function getStyleNode(){
    let sN = document.getElementById('bgimagecss'); 
    if (sN){
       return sN;
    } 
    sN =  document.createElement('style');
    sN.type = "text/css"
    sN.id = 'bgimagecss'    
    document.head.append(sN);
    
    return sN
}

function get_rough_options(el) {
    
    if(typeof el.dataset.options != "undefined" && el.dataset.options){
        try{
            options = string_to_object(el.dataset.options);
            return options
        } catch(e){
            console.log(e);
        }
    };

    //check for presets
    let pn = "none"

    el.classList.forEach(cn => {
        pn = cn.match(/preset[\w\-]+/) || pn;
    })

    if(Array.isArray(pn)) pn = pn.join();
    
    let presets = get_rough_presets(); //returns a map with presets.
    return  presets.get(pn);
}

function get_rough_presets(nwp){
    if(typeof get_rough_presets.presets == 'undefined' ){
        get_rough_presets.presets = new Map([
            ['preset_outline_only',         { roughness: 4, bowing:2, strokeWidth: 1.5, stroke: '#333'}],
            ['preset_thinner_whitefill',    { fillStyle: 'solid', fill: '#222', roughness: 4, bowing:2, strokeWidth: 1.5, stroke: '#eee'}],
            ['preset_darkbg_whitestroke',   { fillStyle: 'solid', fill: '#222', roughness: 4, bowing:2, strokeWidth: 1.5, stroke: '#eee'}],
            ['preset_thin_outline',         { roughness:2, bowing:0.9, strokeWidth: 0.5, stroke: '#333'}],
            ['preset_thick_lightblue',      { fill: 'lightblue', fillStyle: 'zigzag', hachureAngle: 60, hachureGap: 4, roughness: 3 }],
            ['preset_header_scratch',       { fill: 'rgba(141, 30, 227, 0.1)', fillStyle: 'zigzag', fillWeight: 2, hachureAngle: 135, hachureGap: 16, roughness: 5, stroke: 'none' }],
            ['preset_menu-item',            { fill: 'lightgreen', fillStyle: 'zigzag', hachureAngle: 60, hachureGap: 8, roughness: 2.5 }],
            ['preset_textbutton',           { fill: 'lightblue', fillStyle: 'cross-hatch', hachureAngle: 40, hachureGap: 3, roughness: 2}],
            ['preset_lightpurple_thincross', { fill: 'rgba(190, 2, 238, 0.3)', fillStyle: 'cross-hatch', hachureAngle: 33, hachureGap: 3, roughness: 3}],
            ['preset_portfolio_item',       { fillStyle: 'zigzag', stroke: 'none', fillWeight: 16, fill: 'rgba(229, 188, 255, 0.4)', hachureGap: 30, roughness: 10, bowing:2}],
            ['preset_page_heading',         { fill: 'red', fillStyle: 'zigzag', hachureAngle: 60, hachureGap: 8, roughness: 4 }],      
            ['none',                        {fill: 'none', fillStyle: 'zigzag', hachureGap: 8, roughness: 5}]
        ]);  
    }
    if(nwp){
        let key, settings
        [key, settings] = nwp; 
        get_rough_presets.presets.set(key, settings)
    }
    return get_rough_presets.presets; 
}

function on_resize(){
    const fn = on_resize

    if (typeof fn.w == 'undefined' || typeof fn.h == 'undefined' ){
        fn.w = window.innerWidth
        fn.h = window.innerHeight
    }

    const n = {w: window.innerWidth, h: window.innerHeight}

    let curWDelta = Math.abs( fn.w -  n.w ) / fn.w * 100
    let curHDelta = Math.abs( fn.h -  n.h ) / fn.h * 100
   
    if (curWDelta > 5 || curHDelta > 30){
        delete create_nthchild_selector.done
        write_default_states_css(roughwrappers) 
        frameImages();     
    }

    document.documentElement.style.setProperty('--js_curr_viewport_h', `${n.w * 0.01}px`)
    fn.w =n.w
    fn.h =n.h
}

async function decorate_logo_svgs(){
    try{
        await draw_svg_path(document.getElementById('header-logo__svg'));
        await draw_svg_path(document.getElementById('footer-logo__svg'));
    } catch (error) {
        console.log(error)
    }    
}

async function draw_rectangular_canvas(el, options) {
    let dims = await getElementDimensions(el)
    let vc = createVirtualCanvas(el, dims.width, dims.height)
    const rc = rough.canvas(vc)
    await rc.rectangle(0.03 * dims.width, 0.03 * dims.height, 0.94 * dims.width, 0.94 * dims.height, options) // x, y, width, height, options
    return vc;
}


async function draw_circular_background(el, options){
    let dims = await getElementDimensions(el)
    let vc = createVirtualCanvas(el, dims.width, dims.height)
   	let radius = 0.5 * dims.width;
   	const rc = rough.canvas(vc);
	await rc.circle( radius, radius, 0.9 * dims.width, options); // x, y, width, height, options
    await setCanvasToBGimg(el, vc);
}

async function draw_svg_path(el, options){
    const svg = el.querySelector('svg') || el
    options = options || {roughness: 0.5, strokeWidth: 0.25, simplification: 0.9, fill: 'grey'}; 
    const rc = rough.svg(svg, {async: true});
    const svgpaths = svg.querySelectorAll("path");
    for (const svgpath of svgpaths) {
        svgpath.style.fill = 'none';   
        let node = await rc.path(svgpath.getAttribute("d"), options ); // x, y, width, height
        svgpath.remove();
        svg.append(node);
    }
}

async function draw_multiple_svg_paths(el, options){
  const rc = rough.svg(el, {async: true});
  options = options || {roughness: 0.5, strokeWidth: 0.25, simplification: 0.9, fill: 'grey'}; 
  svgpaths = el.querySelectorAll("path");
  for(p of svgpaths){
    p.style.fill = 'none';
    let node = await rc.path(p.getAttribute("d"), options ); // x, y, width, height
    p.remove();
    el.append(node);  
  }
}

/*
(async () => {
  let workerAdd = workly.proxy(busyAdd);
  console.log(await workerAdd(23, 16)); // 39
  // the busyAdd is executed in a worker so
  // the UI does not get blocked
})();
*/

function blobToUrl(blob){
    return URL.createObjectURL(blob)
}

async function setCanvasToBGimg(el, cvobj){
    try {
        await cvobj.toBlob(blob => {
            if(blob){
                //let url = workly.proxy(blobToUrl)
                //let url = URL.createObjectURL(blob);
                let url = blobToUrl(blob)
                el.style.backgroundImage = 'url(' + url  + ')';
            }  else {
                throw 'failed to create a blob for element with id ' + el.id;
            }  
        }, 'image/png', 0.90)      
    } catch (error) {
        console.log(error);        
    }
}

async function setHoverStateBGImage(el, cvobj){
    const oldUrl = el.style.backgroundImage 
    try {
        await cvobj.toBlob(blob => {
            if(blob){
                el.style.transition = '0.3s'
                el.addEventListener('mouseenter', () => el.style.backgroundImage = `url(${blobToUrl(blob)})` )
                el.addEventListener('mouseleave', () => el.style.backgroundImage = oldUrl )
            } else {
                throw 'failed to create a blob for element with id ' + el.id;
            }  
        }, 'image/png', 0.90)      
    } catch (error) {
        console.log(error);        
    }
}

function create_nthchild_selector(selector){
    const cns = create_nthchild_selector
    if (typeof cns.done == 'undefined'){
        cns.done = [];
    }
    for(let i=0; i< cns.done.length; i++){
        let sel = cns.done[i]
        if (sel.selector == selector){ 
            sel.counter += 1       
            return `${sel.selector}:nth-child(${sel.counter})`
        }

    }

    let newSel = {selector: selector, counter: 1}
    cns.done.push(newSel) 
    return `${newSel.selector}:nth-child(${newSel.counter})`
}

function createBgimageCSS(cvobj, sel){

    cvobj.toBlob(async blob => {
        if(blob){  
            const url = await blobToUrl(blob)        
            //update_css_rule(sel, `background-image: url('${url}');`, styleNode) 
            update_css_rule2(sel, {property: 'background-image', value: `url(${url})`}) 
        } 
    }, 'image/png', 0.90) 
}

function update_css_rule2(sel='', newRule=null){
    const styleNode =  getStyleNode() 
    const fn = update_css_rule2
    if(typeof fn.rules == 'undefined'){
        fn.rules = new Array();
        
    }   
    if(!sel ) return;

    let rulesIndex
    if(!newRule){
        rulesIndex = searchRulesForSelector(fn.rules, sel )
        if(rulesIndex){
            let styleRules = ''
            fn.rules[rulesIndex].style.forEach(stdec => {
                styleRules += `${stdec.property}:${stdec.value};` 
            })
            console.log(`existing declaration: ${sel}{${styleRules}}`)
            return `${sel}{${styleRules}}`
        }
    }

    let newRules = []
    if( Array.isArray(newRule) ) {
        newRules = newRule
    }  else {
        newRules.push(newRule)
    }

    rulesIndex =  searchRulesForSelector(fn.rules, sel ) // returns index of selector already in rules.
    if(!rulesIndex){
        fn.rules.push({selector: sel, style: newRules })
    }

    if(rulesIndex){
        //if selector already in the rules
        //check if the property is already set and if so, overwrite it.
        for (const r of newRules) {
            let ow = false //overwritten
            //loop through existing styles to check if the property is already declared for this selector
            for(const ex of fn.rules[rulesIndex].style){
                if (r.property == ex.property){
                    ex.value = r.value
                    ow = true
                } 
            }
            if (! ow ){
                fn.rules[rulesIndex].style.push({property: r.property, value: r.value})    
            }

        }
    }  

    styleNode.textContent = '' 
    for(let rule of fn.rules){
        let css = '' 
        rule.style.forEach(stdec => {
            css += `${stdec.property}:${stdec.value};` 
        })
        styleNode.textContent +=  `\n${rule.selector}{${css}}\n`
    }
    
 }

function searchRulesForSelector(rules, selector){
    for (let i = 0; i < rules.length; i++) {
        if (rules[i].selector === selector) {
          return i;
        }
     }
    return false
}

 function findBySelector(array, selector) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].selector === selector) {
        return array[i];
      }
    }
    return false
  }

// function assemble_css(){
//     const styles = update_css_rule()
//     let css = '' 
//     for(declaration of styles){
//         css +=  `\n${declaration.selector}{${declaration.style}}\n`
//     }
//     return css
// }

function getElementDimensions(el){
    let width, height;
    if (window.getComputedStyle(el).display != "none") {
        width = el.scrollWidth;
        height = el.scrollHeight;
        return {width, height};
    }
    // element has display:none set.
    // get active css strings
    let wstyle = window.getComputedStyle(el).width, 
        hstyle = window.getComputedStyle(el).height,
        frw = parseInt(wstyle, 10) / 100, 
        frh = parseInt(hstyle, 10) / 100;
    
    function findDisplayedParent(node){
        let p = node.parentNode, i = 0;
        while(window.getComputedStyle(p).display == "none" && i <= 500){ 
              p = p.parentNode
              i++;
        }
        return p;
    }    
        
    switch(true){
        case wstyle.match("px"):
            width = parseInt(wstyle);
            break;
        case wstyle.match("vw"):
            width = frw * window.innerWidth;
            break;           
        case wstyle.match("%"):
            nearestVisibleParent = findDisplayedParent(el);
            width = frw * nearestVisibleParent.scrollWidth;
            break;   
    }

    switch(true){
        case hstyle.match("px"):
            width = parseInt(hstyle);
            break;
        case hstyle.match("vh"):
            width = frh * window.innerHeight;
            break;           
        case hstyle.match("%"):
            nearestVisibleParent = findDisplayedParent(el);
            width = frh * nearestVisibleParent.scrollHeight;
            break;   
    }
    return {width, height};
}


function createVirtualCanvas(el, width= 0, height=0){
    if(width == 0 || height == 0){
        let dims = getElementDimensions(el)
        width = dims.width
        height = dims.height
    }
    let vcanv = document.createElement('canvas')
    vcanv.setAttribute('width', width)
    vcanv.setAttribute('height', height)
    return vcanv
};

/* check if object is empty. Returns true if it is.*/ 
function isObjectEmpty(obj){
    if(typeof obj != "object")
        return typeof obj;

    return (Object.keys(obj).length === 0 && obj.constructor === Object)
}

/*
** converts structured strings into objects.
** strings need to be in the format: key:value,key2:value2 etc.
** number values may be integers or floats with period decimal separator.
*/
function string_to_object(str) {
    if (typeof str != 'string') return;
 
    //we need to recast the data-options string into a format that we can convert into a js object
    //first we surround text with literal double quotation marks and remove them again for simple integer values
    str = str.replace(/([\w\-\.]+)\s?:\s?([\w\-\.]+)/g, "\"$1\":\"$2\"").replace(/\"(\d+[\.]?\d*)\"/g, "$1");
    //add braces if not present
    if (!/[{}]/.test(str))
        str = "{" + str + "}";
    //now we can attempt to convert the string into an object	    
    let obj = JSON.parse(str);

    //check if something went wrong
    if (typeof obj != 'object') {
        throw `failed to convert string:\n' ${str} '\nallowed characters: - _ . `
    }

    return obj;
}

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 */
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

function decode_rot13(rot13_encoded_string){
    return rot13_encoded_string.replace(/[a-zA-Z]/g, c => String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26))
};	


function frameImages(){
    const picturesToFrame = Array.from(document.querySelectorAll('.framed-image'));
    for(let im of picturesToFrame){
        if (im.classList.contains('dark-on-light')){
            let framedimg = new imageFrame(im, '#222')
        } else {
            let framedimg = new imageFrame(im)
        }
    }
}


class imageFrame{
    constructor(pic, color){
      this.color = color || '#eee';
      this.pic = pic
      this.frame = this.makeFrame()  
      this.framePic();
      this.picDims = this.getPicdims(pic)
    }
    
    makeFrame(){
        const pic = this.pic
        const cv = document.createElement('canvas')
        cv.classList.add('framed-image__frame')
        const picdims = this.getPicdims(pic);
        cv.width = picdims.w;
        cv.height = picdims.h;
        const pad = Math.max(2, 0.005 * picdims.w)
        const thick = Math.min(32, 0.04 * picdims.w)
        console.log(thick, pad)
        let sw = picdims.w - pad
        let sh = picdims.h - pad
  
        let path = `m${pad} ${pad} H ${sw} V ${sh} H ${pad}z m${pad + thick } ${pad+thick} H ${sw - thick } V ${sh - thick } H ${pad+thick}z` 

        const roughCv = rough.canvas(cv)
        roughCv.path(path, {fill: 'none', fillStyle: 'solid', stroke: 'none', bowing: 2})
        roughCv.path(path, {fill: this.color, fillStyle: 'zigzag', fillWeight: 2, hachureGap: 10, stroke: this.color, bowing: 2, roughness: 2, disableMultiStrokeFill: true})
        return cv;
     }
    
    framePic(){
        const d = this.getPicdims(this.pic)
        var wall
        if (this.pic.parentElement.classList.contains('framed-image__hook')){
            wall = this.pic.parentElement.parentElement
            wall.appendChild(this.pic);
            wall.querySelector('.framed-image__hook').remove()
        } else {
            wall =  this.pic.parentElement 
        }
        const hook = document.createElement('div');
        hook.classList.add('framed-image__hook');
        wall.appendChild(hook)
        //hook.style.height = d.h + 'px'; 
        //hook.style.width = d.w + 'px';  
        hook.appendChild(this.pic)
        hook.appendChild(this.frame)
        
        do_caption_styling(this.pic)

        function do_caption_styling(p){
            const caption = p.querySelector('figcaption')

            if (! caption )
                return;

            if(!caption.id && p.id){
                caption.id = p.id + '_caption'; 
            }
            
            if(! caption.id){
                const img = p.querySelector('img')
                console.log(img)
                if (img){
                    caption.id = img.classList[0] + + '_caption'; ;
                }
            }

            if (! caption.id ){
                let ancestor = p.parentElement
                while (! caption.id) {
                    if( ancestor.id ){
                        caption.id = ancestor.id + '_caption'; ;
                        break;
                    }     
                    ancestor = ancestor.parentElement
                }
            } 
            const opts = { fillStyle: 'solid', fill: '#222', roughness: 4, bowing:2, strokeWidth: 1.5, stroke: '#eee'};
            
            const canvas_promise = draw_rectangular_canvas(caption, opts);
            canvas_promise.then(canvas => setCanvasToBGimg(caption, canvas))
 
        }

       


        
    } 
    
    getPicdims(pic){
      return {w: pic.scrollWidth || pic.width, h: pic.scrollHeight || pic.height }
    }
    
  }  
  
  
  
  
  
  
