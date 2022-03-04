<?php 

/**
 * Filters the next, previous and submit buttons.
 * Replaces the forms <input> buttons with <button> while maintaining attributes from original <input>.
 *
 * @param string $button Contains the <input> tag to be filtered.
 * @param object $form Contains all the properties of the current form.
 *
 * @return string The filtered button.
 */
add_filter(
	'gform_next_button', 
	function ($button, $form ){
		return dvi_form_button($button, $form, 'icon-step-forward', 'form__nextbtn-textspan');
	}, 10, 2 
);


add_filter( 
	'gform_previous_button', 
	function ($button, $form ){
		return dvi_form_button($button, $form, 'icon-step-backward', 'form__prevbtn-textspan');
	}, 10, 2 
);

add_filter( 
	'gform_submit_button', 
	function ($button, $form ){
		return dvi_form_button($button, $form, 'icon-play', 'form__submitbtn-textspan');
	}, 10, 2 
);

function dvi_form_button($button, $form, $iconclass='', $spanclass=''){
    $dom = new DOMDocument();
    $dom->loadHTML( '<?xml encoding="utf-8" ?>' . $button );
  
    $new_button = $dom->createElement( 'button' );
	
	// $icontag = $dom->createElement('i');
    // $icontag->setAttribute('class', $iconclass);
	// $new_button->appendChild($icontag);
	
	$btnTextSpan = $dom->createElement('span');
    $btnTextSpan->setAttribute('class', $spanclass);
	//$btnTextSpan->appendChild($icontag);
	
	$input = $dom->getElementsByTagName( 'input' )->item(0);
	
	$btnTextSpan->appendChild( $dom->createTextNode( $input->getAttribute( 'value' ) . ' ' ) );   
    
	$new_button->appendChild($btnTextSpan); 
	
	$input->removeAttribute( 'value' );
	
	foreach( $input->attributes as $attribute ) {
        $new_button->setAttribute( $attribute->name, $attribute->value );
    }
	
    $classList = $new_button->getAttribute('class');
    $new_button->setAttribute('class', $classList . ' gravityformbutton preset_textbutton');

    $input->parentNode->replaceChild( $new_button, $input );
 
    return $dom->saveHtml( $new_button );
}

/** I completely forgot what this did. */
add_filter( 'gform_confirmation_anchor_2', '__return_false' );

?>