<?php
/**
 * Plugin Name:       devlaminteractie plugin
 * Plugin URI:        https://www.devlaminteractie.nl
 * Description:       custom functions and scripts voor devlaminteractie.nl.
 * Version:           0.03
 * Author:            Willem de Vlam
 * Author URI:        https://www.devlaminteractie.nl
 */

if(! defined('WPINC'))
    wp_die();

/** 
 * compose the url for the folder containing this plugin. 
 */
if ( ! defined( 'DVI_PLUGINFOLDER_URL' ) ) {
	// in main plugin file 
	define(
		'DVI_PLUGINFOLDER_URL', 
		trailingslashit( 
			trailingslashit( plugins_url() ) . plugin_basename( dirname( __FILE__ ) ) 
		) 
	);
}

 add_action( 'wp_enqueue_scripts', 'dvi_enqueue_scripts' );

function dvi_enqueue_scripts(){ 
	
	wp_enqueue_script( 'workly','https://cdn.jsdelivr.net/gh/pshihn/workly/dist/workly.min.js');
	//dvi_update_async_script_handles('workly');
    wp_enqueue_script('rough', "https://cdn.jsdelivr.net/npm/roughjs@4.4.1/bundled/rough.min.js", array() , '4.4.1');
	//dvi_update_async_script_handles('rough');
    dvi_enqueue_autoversioned_script('devlaminteractie',  DVI_PLUGINFOLDER_URL . "devlaminteractie.js" , array('rough', 'workly' ));
	dvi_enqueue_autoversioned_script('dvi-common',  DVI_PLUGINFOLDER_URL . "assets/js/common.js" , array('devlaminteractie' ), true);
    wp_enqueue_style('dvi_styles', DVI_PLUGINFOLDER_URL . 'devlaminteractie.css');

	wp_dequeue_script( 'jquery' );
    wp_deregister_script( 'jquery' );
	//  $ver = '1.12.4';
	$ver = '3.6.0';
	wp_register_script( 'jquery', "https://ajax.googleapis.com/ajax/libs/jquery/$ver/jquery.min.js", '', $ver );
	//use local jquery as fallback
    // wp_add_inline_script( 'jquery', 'window.jQuery||document.write(\'<script src="'.includes_url( '/js/jquery/jquery.min.js' ).'"><\/script>\')' );
	wp_enqueue_script ( 'jquery' );
	if(! array_key_exists( 'ct_builder', $_REQUEST) ){
		dvi_update_async_script_handles('jquery');
		dvi_update_defer_script_handles('jquery');
	}
}

/**
* adds link preloading on hover to site. Lowest priority so it will load loast in the header.
*/
add_action('wp_head', function(){
	?>
	<script src="//instant.page/5.1.0" type="module" integrity="sha384-by67kQnR+pyfy8yWP4kPO12fHKRLHZPfEsiSXR8u2IKcTdxD805MGUXBzVPnkLHw"></script>
	
	<?php
}, 100000000000000);

/**
 * returns static handle array for asynchronously loading scripts.
 * adds handle to array if present and not in array.
 * creates it if it doesn't exist yet.. 
 * @param string handle
 * @return	array  
 */
function dvi_update_async_script_handles($handle=''){
	static $handle_array = array();

	if ($handle && ! in_array($handle, $handle_array) ) 
		$handle_array[] = $handle;
		
	return $handle_array;
}

/**
 * adds async tag attribute if the handle was added to the async handle array using
 * dvi_update_async_script_handles()
 * @uses dvi_update_defer_script_handles() 
 * @param string $tag the tag as generated by wordpress
 * @param string $handle the handle as defined in wp_enqueue  	
 */
function dvi_add_tag_attribute_async($tag, $handle){
	$handles = dvi_update_async_script_handles();
	
	if (! empty($handles) && in_array($handle, $handles ) )
		$tag = str_replace( ' src', ' async="async" src', $tag );
	
	return $tag;
}

/**
 * returns static handle array for deferring scripts.
 * adds handle to array if present and not in array.
 * creates it if it doesn't exist yet.. 
 * @param string script handle
 * @return	array  
 */
function dvi_update_defer_script_handles($handle=''){
	static $handle_array = array();

	if ($handle && ! in_array($handle, $handle_array) ) 
		$handle_array[] = $handle;
		
	return $handle_array;
}

/**
 * adds defer tag attribute if the handle was added to the defer handle array using
 * dvi_update_defer_script_handles()
 * @uses dvi_update_defer_script_handles() 
 * @param string $tag the tag as generated by wordpress
 * @param string $handle the handle as defined in wp_enqueue  	
 */
function dvi_add_tag_attribute_defer($tag, $handle){
	$handle_defer_array = dvi_update_defer_script_handles();
	
	if (! empty($handle_defer_array) && in_array($handle, $handle_defer_array ) )
		$tag = str_replace( ' src', ' defer="defer" src', $tag );
	
	return $tag;
}

add_filter( 'script_loader_tag', 'dvi_add_tag_attributes', 10, 2 );
function dvi_add_tag_attributes( $tag, $handle ) {

	$tag = dvi_add_tag_attribute_async($tag, $handle);

	$tag = dvi_add_tag_attribute_defer($tag, $handle);
		
	return $tag;	
}

/**
 * Prints scripts or data before the closing body tag on the front end.
 *
 */
function action_wp_footer() : void {
}

function dvi_enqueue_autoversioned_script($handle, $file_url, $deps = array(), $footer = false){
    /* convert the URL into a server path */
    $pluginpath = trailingslashit( dirname(__FILE__, 1) ); //this assumes this function is in the main plugin.php file.
    $file_dir = trailingslashit( basename(dirname($file_url)) ); //grab foldername at end of file_url. 
    $file_path = $pluginpath . $file_dir . basename($file_url); 
    wp_enqueue_script(
        $handle,  
        $file_url, 
        $deps,  
        filemtime($file_path), 
        $footer
    );
}

/** does what it says on the tin. wrapper for dvi_shorten_string 
 * @param string
 * @return string truncated at 20 words
*/
function dvi_shorten_to_20_words($str) {
	return dvi_shorten_string($str, 20);
}

/** does what it says on the tin. wrapper for dvi_shorten_string 
 * @param string
 * @return string truncated at 20 words
*/
function dvi_shorten_to_10_words($str) {
	return dvi_shorten_string($str, 10);
}


/** does what it says on the tin. wrapper for dvi_shorten_string 
 * @param string $str 
 * @param integer $words the target maximum number of words
 * @param string $append the string to append to the truncated string. default: '...' (ellipsis)
 * @return string truncated at $words words
*/
function dvi_shorten_string($str='', $words=50, $append = ''){
	if(!$str || !is_string($str))
        return "first argument must be a string: dvi_shorten_string(str:'a string', (words: 50), (append: '...'))";
    
    $array_from_string = explode(' ', $str);

    if( count($array_from_string) > $words){
		$stringarray_topslice = array_slice($array_from_string, 0, $words);
		return implode(' ', $stringarray_topslice) . $append;	
	} 
	
    return $str;
}

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
	
	$icontag = $dom->createElement('i');
    $icontag->setAttribute('class', $iconclass);
	$new_button->appendChild($icontag);
	
	$btnTextSpan = $dom->createElement('span');
    $btnTextSpan->setAttribute('class', $spanclass);
	
	$input = $dom->getElementsByTagName( 'input' )->item(0);
	
	$btnTextSpan->appendChild( $dom->createTextNode( $input->getAttribute( 'value' ) ) );   
    
	$new_button->appendChild($btnTextSpan); 
	
	$input->removeAttribute( 'value' );
	
	foreach( $input->attributes as $attribute ) {
        $new_button->setAttribute( $attribute->name, $attribute->value );
    }
	
    $input->parentNode->replaceChild( $new_button, $input );
 
    return $dom->saveHtml( $new_button );
}

?>