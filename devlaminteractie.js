
var roughwrappers
var WINDOW_WIDTH = window.innerWidth
var WINDOW_HEIGHT = window.innerHeight

//var DCLtime

document.addEventListener('DOMContentLoaded', (event) => {
    //DCLtime = Date.now()
    roughwrappers = Array.from(document.querySelectorAll('.rough_wrapper, .__textbutton'))
});

window.onload = () =>{
    //console.log(Date.now() - DCLtime, ' seconds since Domcontenloaded')
    roughwrappers.forEach(async el =>{
        await get_rough_options_and_draw(el, draw_rectangular_background);
    })
    decorate_logo_svgs();
}

window.addEventListener("orientationchange", function(event) {
    console.log(`orientation changed by ${event.target.screen.orientation.angle}`);
  });

// looking for a way to create something like a static var in js  
// function windowDimensions(){
//     w = window.innerWidth
//     h = window.innerHeight
//     return {w, h}
// }

window.addEventListener('resize', debounce( () =>{
        let curWDelta =  Math.abs( WINDOW_WIDTH - window.innerWidth ) / WINDOW_WIDTH * 100
        let curHDelta =  Math.abs( WINDOW_HEIGHT - window.innerHeight ) / WINDOW_HEIGHT * 100

        if (curWDelta < 20 && curHDelta < 30){
            WINDOW_WIDTH = window.innerWidth
            WINDOW_HEIGHT = window.innerHeight
            return
        }
        
        roughwrappers.forEach(async el =>{
            await get_rough_options_and_draw(el, draw_rectangular_background);
        })

        WINDOW_WIDTH = window.innerWidth
        WINDOW_HEIGHT = window.innerHeight
        
        document.documentElement.style.setProperty('--js_curr_viewport_h', `${WINDOW_HEIGHT * 0.01}px`)
}, 50))

// window.onresize = () =>{


//     roughwrappers.forEach(async el =>{
//         await get_rough_options_and_draw(el, draw_rectangular_background);
// })



async function decorate_logo_svgs(){
    try{
        await draw_svg_path(document.getElementById('header_logo_svg'));
        await draw_svg_path(document.getElementById('footer__logo-svg'));
    } catch (error) {
        console.log(error)
    }    
    
}

async function get_rough_options_and_draw(el, drawfunction,  options = {}) {
    //abort if roughjs did not load for some reason.
    if (typeof(rough) == 'undefined' || el.length == 0 ) return;
    
    if(Object.keys(options).length !== 0) {
        drawfunction(el, options)
        return
    }

    if(typeof el.dataset.options != "undefined" && el.dataset.options){
        options = await string_to_object(el.dataset.options);
        drawfunction(el, options);
        return
    };

    //check for presets
    let pn = "none"
    el.classList.forEach(cn => {
        pn = cn.match(/preset[\w\-]+/) || pn;
    })
    if(Array.isArray(pn)) pn = pn.join();
    switch (pn) {
        case 'preset_outline_only':
            options = { roughness: 4, bowing:2, strokeWidth: 1.5, stroke: '#333'};
            break;
        case 'preset_thick_lightblue':
            options = { fill: 'lightblue', fillStyle: 'zigzag', hachureAngle: 60, hachureGap: 4, roughness: 3 };
            break;
        case 'preset_menu-item':
            options = { fill: 'lightgreen', fillStyle: 'zigzag', hachureAngle: 60, hachureGap: 8, roughness: 2.5 };
            break;
        case 'preset_textbutton':
            options = { fill: 'blue', fillStyle: 'cross-hatch', hachureAngle: 40, hachureGap: 3, roughness: 2};
            break;
        case 'preset_lightpurple_thincross':
            options = { fill: 'rgba(190, 2, 238, 0.3)', fillStyle: 'cross-hatch', hachureAngle: 33, hachureGap: 3, roughness: 3};
            break;
        case 'preset_portfolio_item':
                options = { roughness: 4, bowing:2, strokeWidth: 1.5, stroke: '#b33'};
                break;    
        default:
            options = {
                fill: 'lightgrey',
                fillStyle: 'zigzag',
                hachureAngle: 80,
                hachureGap: 8,
                roughness: 5
            }
    }
    drawfunction(el, options);
}

async function draw_rectangular_background(el, options) {
    let dims = await getElementDimensons(el)
    //console.log(`el id ${el.id} : w: ${dims.width} ; h: ${dims.height} .`)
    let vc = createVirtualCanvas(el, dims.width, dims.height)
    const rc = rough.canvas(vc)
    await rc.rectangle(0.03 * dims.width, 0.03 * dims.height, 0.94 * dims.width, 0.94 * dims.height, options) // x, y, width, height, options
    // workerSetCanvasToBGimg = workly.proxy(setCanvasToBGimg)
    // workerSetCanvasToBGimg(el, vc);
    await setCanvasToBGimg(el, vc);
}

async function draw_circular_background(el, options){
    let dims = await getElementDimensons(el)
    let vc = createVirtualCanvas(el, dims.width, dims.height)
   	let radius = 0.5 * dims.width;
   	const rc = rough.canvas(vc);
	await rc.circle( radius, radius, 0.9 * dims.width, options); // x, y, width, height, options
    //workerSetCanvasToBGimg = workly.proxy(setCanvasToBGimg)
    // workerSetCanvasToBGimg(el, vc);
    await setCanvasToBGimg(el, vc);
}

async function draw_svg_path(el, options){
  		const rc = rough.svg(el, {async: true});
        svgpath = el.querySelector("path");
        svgpath.style.fill = 'none';
        options = options || {roughness: 0.5, strokeWidth: 0.25, simplification: 0.9, fill: 'grey'}; 
        let node = await rc.path(svgpath.getAttribute("d"), options ); // x, y, width, height
        svgpath.remove();
        el.append(node);
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
                //let workerBlobToUrl = workly.proxy(blobToUrl)
                //let url = URL.createObjectURL(blob);
                let url = blobToUrl(blob)
                el.style.backgroundImage = 'url(' + url  + ')';
            }   
        }, 'image/png', 0.90)      
    } catch (error) {
        console.log(blob);        
    }
}


// let dims = getElementDimensons(el);
// let w = dims.width, h = dims.height

function getElementDimensons(el){
    let width, height;
    if (window.getComputedStyle(el).display != "none") {
        width = el.scrollWidth;
        height = el.scrollHeight;
        return {width, height};
    }
    // element has display:none set.
    //get active css strings
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
        case hstyle.match("vw"):
            width = frw * window.innerWidth;
            break;           
        case hstyle.match("%"):
            nearestVisibleParent = findDisplayedParent(el);
            width = frw * nearestVisibleParent.scrollWidth;
            break;   
    }
    return {width, height};
}

// function draw_multiple_svg_paths(el, options){
//   const rc = rough.svg(el);
//   const svgpaths = el.querySelectorAll("path");
//   options = options || {roughness: 0.5, strokeWidth: 0.25, simplification: 0.9, fill: 'grey'}; 
//   svgpaths.forEach(p => {
//     p.style.fill = 'none';
//     let node = rc.path(p.getAttribute("d"), options ); // x, y, width, height
//     p.remove()
//     el.append(node);
//   });   
// }

function createVirtualCanvas(el, width= 0, height=0){
    if(width == 0 || height == 0){
        let dims = getElementDimensons(el)
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
    if(typeof(obj) != "object")
        return typeof(obj);

    return (Object.keys(obj).length === 0 && obj.constructor === Object)
}

/*
** converts structured strings into objects.
** strings need to be in the format: key:value,key2:value2 etc.
** number values may be integers or floats with period decimal separator.
*/
function string_to_object(str) {
    if (!typeof(str) == 'string') {
        console.log("no string passed")
        return;
    }
    let error_log = 'failed to convert string:\n' + str + '\nallowed characters: - _ . '

    //we need to recast the data-options string into a format that we can convert into a js object
    //first we surround text with literal double quotation marks and remove them again for simple integer values
    str = str.replace(/([\w\-\.]+)\s?:\s?([\w\-\.]+)/g, "\"$1\":\"$2\"").replace(/\"(\d+[\.]?\d*)\"/g, "$1");
    //add braces if not present
    if (!/[{}]/.test(str))
        str = "{" + str + "}";
    //now we can attempt to convert the string into an object	
    let obj = JSON.parse(str);

    //check if something went wrong
    if (typeof(obj) != 'object') {
        console.log(error_log)
        return
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