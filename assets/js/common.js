
var LAST_Y_SCROLL = window.scrollY;

(function create_mobile_menu(){
    
    const burger = document.getElementById('mobile_menu_button')
    
    get_round_btn_bg(burger)

    const cross = document.getElementById('mobmenu__exitbtn')

    attach_mobile_scroll_event();

    burger.addEventListener('click', () => {
        open_mobile_menu(burger, cross);
    })

    cross.addEventListener('click', () => {
        close_mobile_menu(burger, cross);
    })
}
)()


//on resize update css variable in :root
//used by ... something? 
window.onresize = () => {
    document.documentElement.style.setProperty('--js_curr_viewport_h', `${window.innerHeight * 0.01}px`);
};

function attach_mobile_scroll_event(){
    const burger = document.getElementById('mobile_menu_button')
    const pageH = findHighestNode(document.documentElement.childNodes)
    document.onscroll = debounce( () => {
        apply_style_to_element_if(burger, should_scroll_reveal_burger(pageH) === true, 'bottom', '12px', '-80px' )
            
    }, 100)
}

function  apply_style_to_element_if(el, bool, style, styleTrue, styleFalse=''){
        if (bool === null) 
            return;    

        const v = (bool)? styleTrue: styleFalse;
        el.style.setProperty(style, v);
}

async function get_round_btn_bg(el){
    await draw_circular_background(el, {
        fill: 'rgba(206, 242, 25, 0.81)',
        fillStyle: 'zigzag', // solid fill
        fillWeight: 3, // thicker lines
        hachureGap: 8,
    })
}

function open_mobile_menu(burger, cross){
    const gE = id => document.getElementById(id)
       
    gE('header').classList.add('header__mobmenu--open')
    gE('main').classList.add('main__section--mobmenu-visible');
    gE('footer').classList.add('footer__div--mobmenu-visible');
    cross.classList.add('mobmenu__exitbtn--mobmenu-visible')
	cross.classList.remove('mobmenu__exitbtn--mobmenu-hidden')
    toggleMenuDisplay()	 
    
    get_round_btn_bg(cross)
    decorate_selected_elements_rect('.menu-item')
}

function close_mobile_menu(burger, cross){
    const gE = id => document.getElementById(id)

    gE('header').classList.remove('header__mobmenu--open')
    gE('main').classList.remove('main__section--mobmenu-visible');
    gE('footer').classList.remove('footer__div--mobmenu-visible');
	cross.classList.remove('mobmenu__exitbtn--mobmenu-visible')
	cross.classList.add('mobmenu__exitbtn--mobmenu-hidden')
    
    toggleMenuDisplay()	 
    
     get_round_btn_bg(burger)
}

function decorate_selected_elements_rect(classname){
    const items = Array.from(document.querySelectorAll(classname))
    items.forEach(i => {
       get_rough_options_and_draw(i, draw_rectangular_background);
    })
}

function should_scroll_reveal_burger(pageH){
    const delta = 5
    const min = 100
    const w = window
    let ls = LAST_Y_SCROLL
    const Y = w.scrollY

    if(Math.abs(ls - Y) <= delta){
        ls = Y
        return null
    }

    if (Y > ls && Y > min){
        //burger.style.bottom = '-80px'
        ls = Y
        return false
    }
    
    if(Y + w.innerHeight < pageH) {
        ls = Y
        //burger.style.bottom = '12px';
        return true
    }

}

function toggleMenuDisplay(){
	const themenu = document.getElementById('the_menu')
	themenu.classList.toggle('header_menu--mobmenu-hidden')
	themenu.classList.toggle('header_menu--mobmenu-visible')
}

function findHighestNode(nodesList, pageHeight = 0 ) {
    for (var i = nodesList.length - 1; i >= 0; i--) {
        if (nodesList[i].scrollHeight && nodesList[i].clientHeight) {
            var elHeight = Math.max(nodesList[i].scrollHeight, nodesList[i].clientHeight);
            return Math.max(elHeight, pageHeight);
        }
        if (nodesList[i].childNodes.length) findHighestNode(nodesList[i].childNodes, pageHeight);
    }
}

