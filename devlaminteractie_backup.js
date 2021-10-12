($ => {

    $(window).on("load", () =>{
        $('.rough_wrapper').map(
            function() {
                get_rough_options_and_draw($(this), draw_rough_element_background);
            }
        );

    })

    $(window).resize(() => {
        $('.rough_wrapper').map(
            function() {
                get_rough_options_and_draw($(this), draw_rough_element_background);
            }
        );
    });

    function get_rough_options_and_draw(el, drawfunction) {
        //abort if roughjs did not load for some reason.
        if (typeof(rough) == 'undefined') return;
        //abort if no element was found
        if (el.length == 0) return;

        let options = {};
        //check for presets
        let presetname = el.attr('class').match(/preset[\w\-]+/);
        if (presetname) {
            switch (presetname[0]) {
                case 'preset_thick_lightblue':
                    options = { fill: 'lightblue', fillStyle: 'zigzag', hachureAngle: 60, hachureGap: 4, roughness: 3 };
                    break;
                case 'preset_menu-item':
                    options = { fill: 'lightgreen', fillStyle: 'zigzag', hachureAngle: 60, hachureGap: 4, roughness: 1 };
                    break;
            }
        };

        //if no preset class was used check for presence of data-options 
        if ($.isEmptyObject(options)) {
            let dataOptions = el.attr("data-options") || '';
            if (dataOptions)
                options = string_to_object(dataOptions);
        }

        //if all else fails use default
        if ($.isEmptyObject(options)) {
            options = {
                fill: 'lightgrey',
                fillStyle: 'zigzag',
                hachureAngle: 80,
                hachureGap: 8,
                roughness: 5
            }
        };

        /* console.log(options) */

        //if callback function exists run it.
        if (typeof(drawfunction) == 'function')
            drawfunction(el, options);

        return options;
    }

    function draw_rough_element_background(el, options) {
        let virtualCanvas;
        virtualCanvas = $('<canvas/>').prop({
            width: el.width(),
            height: el.height()
        })[0];
        const rc = rough.canvas(virtualCanvas);
        rc.rectangle(5, 5, el.width() - 10, el.height() - 10, options); // x, y, width, height, options
        dataUrl = virtualCanvas.toDataURL();
        el.css('background-image', 'url(' + dataUrl + ')');
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

    $(window).scroll(function(e) {    
        var scroll = e.scrollTop();
	    if (scroll >= 50) {
            menubtn.removeClass("mobmenu-btn--visible");
        } else {
            menubtn.addClass("mobmenu-btn--visible");
        }
	});

})(jQuery)