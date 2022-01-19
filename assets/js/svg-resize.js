function scale_svgs(){
    let a_svgs = Array.from(document.querySelectorAll('svg'))
    a_svgs.forEach(svg => {
        scale_svg_paths(svg)
    })
}

function scale_svg_paths(svg){
        const translation = calculate_translation(svg); //X, Y, scale

        if(translation.scale == 1 ) return;

        let a_paths = Array.from(svg.querySelectorAll('path'))
 
        a_paths.forEach(path => {
            let oldD = path.getAttribute('d')
            let newD = getTransformedPathDStr(oldD, translation.X, translation.Y, translation.scale);
            path.setAttribute("d", newD);
        })
}


/**Calculate the transformation, i.e. the translation and scaling, required
to get the path to fill the svg area. Note that this assumes uniform
scaling, a path that has no other transforms applied to it, and no
differences between the svg viewport and viewBox dimensions. */
function calculate_translation(svg){
  const svgW = svg.scrollWidth;
  const svgH = svg.scrollHeight;
  const a_paths = Array.from(svg.querySelectorAll('path'))
  let bbb = null //biggest bounding box
  a_paths.forEach(path => {
        let bb = path.getBBox();
        if (! bbb ||(bbb.x + bbb.width) < (bb.x + bb.width)) {
            bbb = bb;            
        }
  })
  let scale = Math.min(svgW / bbb.width, svgH / bbb.height)
  const scaled = float => { return float * scale}
  const centered = (pos, dim) => { return scaled(pos)  + ( scaled(dim) / 2 ) }

  // calculate translation required to centre the path
  // on the svg root element

  const X = 0.5 * svgW -  centered(bbb.x, bbb.width);
  const Y = 0.5 * svgH - centered(bbb.y, bbb.height);

  return {X, Y, scale};

}
  
function getTransformedPathDStr(oldPathDStr, pathTranslX, pathTranslY, scale) {

  const oldPathDArr = getArrayOfPathDComponents(oldPathDStr);
  let newPathDArr = [];
  let commandParam, isAbsolute, skip
   
  // element index
    oldPathDArr.forEach( (oldPathDComp, idx) =>{

        if(skip > 0 ){
            skip--;
            return;
        }

        // check if component is a single letter, i.e. an svg path command
        if (/^[A-Za-z]$/.test(oldPathDComp)) { 
          // lowercase commands are relative, uppercase are absolute  
          isAbsolute = oldPathDComp === oldPathDComp.toUpperCase();  
         
          newPathDArr[idx] = oldPathDComp;
          commandParam = oldPathDComp.toUpperCase()
          //add letter to path 
          return;
        }    
        
        if (! isAbsolute) { // the translation is only required for absolute commands... is that so? 
            pathTranslX = 0;
            pathTranslY = 0;
        } 

        switch (commandParam) {
            case 'H':
                newPathDArr[idx    ] = Number(oldPathDArr[idx    ]) * scale + pathTranslX;
                break;
            case 'V':
                newPathDArr[idx    ] = Number(oldPathDArr[idx    ]) * scale + pathTranslY;
                break;
            case 'A':
                // the elliptical arc has x and y values in the first and second as well as
                // the 6th and 7th positions following the command; the intervening values
                // are not affected by the transformation and so can simply be copied
                newPathDArr[idx    ] = Number(oldPathDArr[idx    ]) * scale + pathTranslX;
                newPathDArr[idx + 1] = Number(oldPathDArr[idx + 1]) * scale + pathTranslY;
                newPathDArr[idx + 2] = Number(oldPathDArr[idx + 2])                        ;
                newPathDArr[idx + 3] = Number(oldPathDArr[idx + 3])                        ;
                newPathDArr[idx + 4] = Number(oldPathDArr[idx + 4])                        ;
                newPathDArr[idx + 5] = Number(oldPathDArr[idx + 5]) * scale + pathTranslX;
                newPathDArr[idx + 6] = Number(oldPathDArr[idx + 6]) * scale + pathTranslY;
                skip = 6;
                break;
            case 'Z':
                newPathDArr[idx    ] = `M ${Number(oldPathDArr[idx    ]) * scale + pathTranslX}`;
                newPathDArr[idx + 1] = Number(oldPathDArr[idx + 1]) * scale + pathTranslY;
                break;
                //throw new Error('numeric value should not follow the SVG Z/z command');
            default: 
                newPathDArr[idx    ] = Number(oldPathDArr[idx    ]) * scale + pathTranslX;
                newPathDArr[idx + 1] = Number(oldPathDArr[idx + 1]) * scale + pathTranslY;
                skip = 1;
        }
    })
    let newPath = newPathDArr.join(" ");
    return newPath;
}
  


function getArrayOfPathDComponents(str) {
  str = standardizePathDStrFormat(str);
  return str.split(" ");
}


/**   The SVG standard is flexible with respect to how path d-strings are
  formatted but this makes parsing them more difficult. This function ensures
  that all SVG path d-string components (i.e. both commands and values) are
  separated by a single space. */
function standardizePathDStrFormat(str) {
  return str
    .replace(/,/g         , " "   )  // replace each comma with a space
    .replace(/-/g         , " -"  )  // precede each minus sign with a space
    .replace(/([A-Za-z])/g, " $1 ")  // sandwich each   letter between 2 spaces
    .replace(/  /g        , " "   )  // collapse repeated spaces to a single space
    .replace(/ ([Ee]) /g  , "$1"  )  // remove flanking spaces around exponent symbols
    .replace(/^ /g        , ""    )  // trim any leading space
    .replace(/ $/g        , ""    ); // trim any tailing space
}
