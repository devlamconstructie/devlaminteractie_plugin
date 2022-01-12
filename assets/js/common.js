var header, menu, main, footer, burger, cross
let scrollPos

window.addEventListener('load', () => add_mobile_menu_events())

function add_mobile_menu_events() {

    header = document.getElementById('hero-logo__linkwrap')
    menu = document.getElementById('menu')
    main = document.getElementById('main')
    footer = document.getElementById('footer')
    burger = document.getElementById('mobile-menu__open-btn')
    cross = document.getElementById('mobile-menu__close-btn')

    try {
        get_round_btn_bg(burger)
    } catch (error) {
        console.log(error)
    }

    burger.addEventListener('click', () => {
        open_mobile_menu();
    })

    cross.addEventListener('click', () => {
        close_mobile_menu();
    })

    if (window.location.href.match(/ct_builder=true/g))
        return;

    should_scroll_reveal_burger();

    document.onscroll = debounce(() => {
        apply_style_to_element_if(burger, should_scroll_reveal_burger(), 'bottom', '12px', '-80px')

    }, 50)

    document.onscroll = debounce(() => {
        apply_style_to_element_if(burger, should_scroll_reveal_burger(), 'bottom', '12px', '-80px')

    }, 50)

    //on resize update css variable in :root
    //used for responding to mobile viewport changes on UI appearance. 
    document.documentElement.style.setProperty('--js_curr_viewport_h', `${window.innerHeight * 0.01}px`);
    window.onresize = () => {
        document.documentElement.style.setProperty('--js_curr_viewport_h', `${window.innerHeight * 0.01}px`);
    };
}

function apply_style_to_element_if(el, bool, style, styleTrue, styleFalse = '') {
    if (bool === null || typeof bool != 'boolean')
        return;

    const v = (bool) ? styleTrue : styleFalse;
    el.style.setProperty(style, v);
}

async function get_round_btn_bg(el) {
    await draw_circular_background(el, {
        fill: 'rgba(206, 242, 25, 0.81)',
        fillStyle: 'zigzag', // solid fill
        fillWeight: 3, // thicker lines
        hachureGap: 8,
    })
}



function open_mobile_menu() {
    scrollPos = Math.round(window.scrollY) // save current scroll position.
    const toggleO = (el) => el.classList.toggle('js-mmopen')
    const toggleC = (el) => el.classList.toggle('js-mmclosed')
    toggleO(header)
    toggleO(menu)
    toggleO(main)
    toggleO(footer)
    toggleO(cross)
    toggleO(burger)
    toggleC(cross)
    toggleC(burger)

    try {
        get_round_btn_bg(cross)
        decorate_menuItems_for_mobmenu('.menu-item')
    } catch (error) {
        console.log(error)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function close_mobile_menu() {
    const toggleO = (el) => el.classList.toggle('js-mmopen')
    const toggleC = (el) => el.classList.toggle('js-mmclosed')
    toggleO(header)
    toggleO(main)
    toggleO(menu)
    toggleO(footer)
    toggleO(cross)
    toggleO(burger)
    toggleC(cross)
    toggleC(burger)
    window.scrollTo({ top: scrollPos, behavior: 'smooth' });
    scrollPos = 0;
    try {
        get_round_btn_bg(burger)
    } catch (error) {
        console.log(error)
    }
}

function decorate_menuItems_for_mobmenu() {
    const items = Array.from(document.querySelectorAll('.menu-item'))
    let i = 0;
    items.forEach(async el => {
        try {
            let options = await get_rough_options(el)
            const canvas1 = await draw_rectangular_canvas(el, options);
            setCanvasToBGimg(el, canvas1)
            i += 1
            let sNode = getStyleNode()
            const canvas2 = await draw_rectangular_canvas(el, { fill: '#f5bcbd', fillStyle: 'zigzag', hachureAngle: 50, hachureGap: 7, roughness: 3.5 });
            // update_css_rule(`.menu-item:nth-child(${i})::before`,`content:'${el.textContent}';`,sNode)
            // await createBgimageCSS(canvas2, `.menu-item:nth-child(${i})::before`, sNode) 
            update_css_rule(`#${el.id}::before`, `content:'${el.textContent}';`, sNode)
            await createBgimageCSS(canvas2, `#${el.id}::before`, sNode)

            // get_rough_options_and_draw(el, draw_rectangular_background);
        } catch (error) {
            console.log(error)
        }
    })
}

function should_scroll_reveal_burger() {
    //for brevity
    const f = should_scroll_reveal_burger
        //remember document height
    if (typeof f.docH === 'undefined')
        f.docH = document.documentElement.scrollHeight;
    //remember last scroll height
    if (typeof f.lastScrlY === 'undefined')
        f.lastScrlY = 0;

    const d = 5 //delta 
    const min = 100 //absolute scrolling threshold
    const Y = window.scrollY //current scroll 

    if (Math.abs(f.lastScrlY - Y) <= d) {
        f.lastScrlY = Y
        return null
    }

    if (Y > f.lastScrlY && Y > min) {
        f.lastScrlY = Y
        return false
    }

    if (Y + window.innerHeight < f.docH) {
        f.lastScrlY = Y
        return true
    }
}

function toggleMenuDisplay() {
    const themenu = document.getElementById('the_menu')
    themenu.classList.toggle('header_menu--mobmenu-hidden')
    themenu.classList.toggle('header_menu--mobmenu-visible')
}