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

include 'assets/includes/dvi_gravityforms.php';
include 'assets/includes/view.php';
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

if ( ! defined( 'DVI_PLUGINFOLDER_PATH' ) ) {
	// in main plugin file 
	define(
		'DVI_PLUGINFOLDER_PATH', 
		trailingslashit( dirname(__FILE__, 1) )
	);
}



add_action( 'wp_enqueue_scripts', 'dvi_enqueue_scripts', 11 );

function dvi_enqueue_scripts(){ 
	
	wp_enqueue_script( 'workly','https://cdn.jsdelivr.net/gh/pshihn/workly/dist/workly.min.js');
    wp_enqueue_script('rough', "https://cdn.jsdelivr.net/npm/roughjs@4.5.2/bundled/rough.min.js", array() , '4.5.2');
	
	advanced_enqueue_script('dvi-svg-resize',  DVI_PLUGINFOLDER_URL . "assets/js/svg-resize.js", 'autoversion' );
    //wp_enqueue_script('devlaminteractie',  DVI_PLUGINFOLDER_URL . "devlaminteractie.js" , array('rough', 'workly'));
	wp_enqueue_script('devlaminteractie',  DVI_PLUGINFOLDER_URL . "assets/js/devlaminteractie.min.js" , array('rough', 'workly'));
	wp_enqueue_script('dvi-common',  DVI_PLUGINFOLDER_URL . "assets/js/common.js" , array('devlaminteractie' ,'rough', 'workly' ), true);

	wp_enqueue_style('dvi_styles', DVI_PLUGINFOLDER_URL . 'devlaminteractie.css', [], '326');

	wp_dequeue_style('swcfpc_sweetalert_css');
	//wp_dequeue_script( 'jquery' );
    // wp_deregister_script( 'jquery' );
	//  $ver = '1.12.4';
	$ver = '3.6.0';
	
	//use local jquery as fallback
	wp_add_inline_script(
		'jquery', 
		'window.jQuery||document.body.append(\'<script src="' . includes_url( '/js/jquery/jquery.min.js' ).'"><\/script>\')' 
	);
//	wp_enqueue_script ( 'jquery' );
	if(! array_key_exists( 'ct_builder', $_REQUEST) ){
		//dvi_enqueue_script_attr('jquery', 'async', 'defer');
	//	advanced_enqueue_script( 'jquery', "https://ajax.googleapis.com/ajax/libs/jquery/$ver/jquery.min.js", '', '', $ver, true );
		dvi_enqueue_script_attr('dvi-common', 'autoversion');
		dvi_enqueue_script_attr('devlaminteractie','autoversion');
		//wp_dequeue_script( 'bodhi_svg_inline' );
    //	wp_deregister_script( 'bodhi_svg_inline' );
	//	advanced_enqueue_script('bodhi_svg_inline','https://devlaminteractie.nl/wp-content/plugins/svg-support/js/min/svgs-inline-min.js','' , array('jquery'),'1.0.0');
	} else {
	//	wp_enqueue_script( 'jquery',  "https://ajax.googleapis.com/ajax/libs/jquery/$ver/jquery.min.js", '', $ver);
	
	}
	
}

function advanced_enqueue_script($handle, $url, $ops, $deps=array(), $ver='', $foot=false){
	wp_enqueue_script($handle, $url, $deps, $ver, $foot);

	if(!$ops) return;

	if( is_string($ops) ) $ops = str_word_count(esc_html($ops), 1);
	dvi_enqueue_script_attr($handle, ...$ops);
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
* allows using only a single command for different script type attributes.
* @param string $handle the script handle
* @param mixed ...$atts comma separated strings for describing different attributes: accepts 'async', 'defer' and 'module.
*/
function dvi_enqueue_script_attr($handle, ...$atts){
	if(! $handle || empty($atts))
		return;
	
	foreach($atts as $attr){
		switch($attr){
			case('async'):
				dvi_update_async_script_handles($handle);
				break;	
			case('defer'):
				dvi_update_defer_script_handles($handle);
				break;
			case('module'):
				dvi_update_module_script_handles($handle);
				break;
			case('autoversion'):
				dvi_update_autoversion_script_handles($handle);
				break;	
			default:
				break;
		}		
		
	}	
}


/**
 * returns static handle array for asynchronously loading scripts. Returns empty array if none present.
 * adds handle to array if present and not in array.
 * creates it if it doesn't exist yet.
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
 * returns static handle array for scripts loaded as a module.
 * adds handle to array if present and not in array.
 * creates it if it doesn't exist yet.. 
 * @param string script handle
 * @return	array  
 */
function dvi_update_module_script_handles($handle=''){
	static $handle_array = array();

	if ($handle && ! in_array($handle, $handle_array) ) 
		$handle_array[] = $handle;
		
	return $handle_array;
}

/**
 * returns static handle array for scripts intended to autoversion.
 * adds handle to array if present and not in array.
 * creates it if it doesn't exist yet.. 
 * @param string script handle
 * @return	array  
 */
function dvi_update_autoversion_script_handles($handle=''){
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
 * adds defer tag attribute if the handle was added to the defer handle array using
 * dvi_update_defer_script_handles()
 * @uses dvi_update_defer_script_handles() 
 * @param string $tag the tag as generated by wordpress
 * @param string $handle the handle as defined in wp_enqueue  	
 */
function dvi_add_tag_attribute_defer($tag, $handle){
	$handle_defer_array = dvi_update_defer_script_handles();
	
	if (! empty($handle_defer_array) && in_array($handle, $handle_defer_array ) )
		$tag = dvi_insert_string_in_tag($tag, 'defer="defer"');
	
	return $tag;
}

function dvi_insert_string_in_tag($tag, $string){
	return str_replace( " id=", " $string id=", $tag );
}

/**
 * adds type='module' tag attribute if the handle was added to the defer handle array using
 * dvi_update_module_script_handles()
 * @uses dvi_update_module_script_handles() 
 * @param string $tag the tag as generated by wordpress
 * @param string $handle the handle as defined in wp_enqueue  	
 */
function dvi_add_tag_attribute_type_module($tag, $handle){
	$handle_module_array = dvi_update_module_script_handles();
	
	if (! empty($handle_module_array) && in_array($handle, $handle_module_array) )
		$tag = str_replace( ' src', ' type="module" src', $tag );
	
	return $tag;
}

/**
 * adds defer tag attribute if the handle was added to the defer handle array using
 * dvi_update_defer_script_handles()
 * @uses dvi_update_defer_script_handles() 
 * @param string $tag the tag as generated by wordpress
 * @param string $handle the handle as defined in wp_enqueue  	
 */
function dvi_add_tag_auto_version($tag, $handle, $src){
	/* exit if file not on this server */

	// if(! strpos($src, DVI_PLUGINFOLDER_URL))
	// 	return $tag;

	$handle_autov_array = dvi_update_autoversion_script_handles();

	/* exit if no autoversion scripts were queued */ 
	if (empty($handle_autov_array))
		return $tag;

	/* exit if handle not in autov queue */
	if (! in_array($handle, $handle_autov_array ) )
		return $tag;
	
	/* clear version info from src */
	$file_url = explode('?', $src);
	$file_url = array_shift($file_url);
	/* retrieve file edit time from file  */
	$path = str_replace(DVI_PLUGINFOLDER_URL, DVI_PLUGINFOLDER_PATH, $file_url);

	/* maybe I should only replace the ver argument in the string in case there's more args*/
	$newsrc = remove_query_arg( 'ver', $src );
	$newsrc = add_query_arg( 'ver',  filemtime($path), $newsrc );

	$tag = str_replace( $src, $newsrc, $tag );
	
	return $tag;
}

add_filter( 'script_loader_tag', 'dvi_add_tag_attributes', 10, 3 );
function dvi_add_tag_attributes( $tag, $handle, $src ) {

	$tag = dvi_add_tag_attribute_async($tag, $handle);

	$tag = dvi_add_tag_attribute_defer($tag, $handle);

	$tag = dvi_add_tag_attribute_type_module($tag, $handle);
	
	$tag = dvi_add_tag_auto_version($tag, $handle, $src);

	return $tag;	
}



/**
 * wrapper for wp_enqueue_script that insert the version parameter for the wp_enqueue_script function
 * based on the last modified timestamp of the scriptfile. see documentation on wp_enqueue_script for more info.
 * @param string $handle the unique handle for the script. 
 * @param string $file_url the url of the script file.
 * @param array $deps (optional) array of handles the script is dependent on. default is empty array.
 * @param boolean $footer whether to echo the script tag in the footer or the header. 
 */
function dvi_enqueue_autoversioned_script($handle, $file_url, $deps = array(), $footer = false){
    /* convert the URL into a server path */
	$rest = str_replace(DVI_PLUGINFOLDER_URL, '', $file_url );	
    $pluginpath = trailingslashit( dirname(__FILE__, 1) ); //this assumes this function is in the main plugin.php file.
	$file_path = $pluginpath . $rest;
    wp_enqueue_script(
        $handle,  
        $file_url, 
        $deps,  
        filemtime($file_path), 
        $footer
    );
}


/** add mimetype to allowed types
 */
add_filter( 'mime_types',function ( $mime_types ) {
    $mime_types['epub'] = 'application/epub+zip';
    return $mime_types;
});


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

function class_by_longest_word($phrase, $prefix = '', $affixes = array()){
	
	if(!$phrase) return;

	$prefix = $prefix ? $prefix . '--' : "variable_fontsize--";

	if (empty($affixes))
		$affixes = ['d','m','l','xl','xxl'];
	
	$phrase = esc_html($phrase);
	$phrase = str_replace("&shy;", "", $phrase) ;
	if (strlen($phrase > 20))
		return $prefix . $affixes[0];
		
	$LongestWord =  array_reduce(str_word_count( $phrase , 1), function ($v, $p) {
		return strlen($v) > strlen($p) ? $v : $p;
	});

	$Lln = strlen($LongestWord);


	switch( true ){
		case ( $Lln < 6 ):
			$class = $prefix . $affixes[4];
			break;
		case ( $Lln >= 6 && $Lln < 11 ):
			$class = $prefix . $affixes[3];
			break;
		case ($Lln >= 11 && $Lln < 15 ):
			$class = $prefix . $affixes[2];
			break;
		case ($Lln >= 15 && $Lln < 18 ):
			$class = $prefix . $affixes[1];
			break;		
		default:
			$class = $prefix . $affixes[0];	
	}
	return $class;
}




/*create custom Walker because the default wp menu is not great.*/
class Div_Walker_Nav_Menu extends Walker {
    var $tree_type = array( 'post_type', 'taxonomy', 'custom' );
    var $db_fields = array( 'parent' => 'menu_item_parent', 'id' => 'db_id' );
    function start_lvl(&$output, $depth) {
        $indent = str_repeat("\t", $depth);
        $output .= "\n$indent<div class=\"sub-menu\">\n";
    }
    function end_lvl(&$output, $depth) {
        $indent = str_repeat("\t", $depth);
        $output .= "$indent</div>\n";
    }
    function start_el(&$output, $item, $depth, $args) {
        global $wp_query;
        $indent = ( $depth ) ? str_repeat( "\t", $depth ) : '';
        $class_names = $value = '';
        $classes = empty( $item->classes ) ? array() : (array) $item->classes;
        $classes = in_array( 'current-menu-item', $classes ) ? array( 'current-menu-item' ) : array();
        $class_names = join( ' ', apply_filters( 'nav_menu_css_class', array_filter( $classes ), $item, $args ) );
        $class_names = strlen( trim( $class_names ) ) > 0 ? ' class="' . esc_attr( $class_names ) . '"' : '';
        $id = apply_filters( 'nav_menu_item_id', '', $item, $args );
        $id = strlen( $id ) ? ' id="' . esc_attr( $id ) . '"' : ' id="menu_item_' . $item->ID . '"';
        $output .= $indent . '<div' . $id . $value . $class_names .'>';
        $attributes  = ! empty( $item->attr_title ) ? ' title="'  . esc_attr( $item->attr_title ) .'"' : '';
        $attributes .= ! empty( $item->target )     ? ' target="' . esc_attr( $item->target     ) .'"' : '';
        $attributes .= ! empty( $item->xfn )        ? ' rel="'    . esc_attr( $item->xfn        ) .'"' : '';
        $attributes .= ! empty( $item->url )        ? ' href="'   . esc_attr( $item->url        ) .'"' : '';
        $item_output = $args->before;
        $item_output .= '<a'. $attributes .'>';
        $item_output .= $args->link_before . apply_filters( 'the_title', $item->title, $item->ID ) . $args->link_after;
        $item_output .= '</a>';
        $item_output .= $args->after;
        $output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $item, $depth, $args );
    }
    function end_el(&$output, $item, $depth) {
        $output .= "</div>\n";
    }
}

/*
* encodes a mailto-link into a string and prints a container, and a javascript snippet which
* fill the container with a decoded version of the string.
* @param string emailadress or the name of an option setting containing an adress.
* @param string (optional) id for the span container.
*/

function get_obfuscated_email($eml_option, $id){
	$id = ($id)?: 'click_to_send_message';
	$eml = (filter_var($eml_option, FILTER_VALIDATE_EMAIL))? $eml_option : get_option($eml_option);
	
	if(!filter_var($eml, FILTER_VALIDATE_EMAIL))
		return "no valid email found";
	
	$obfeml = str_rot13("<a class='white_text' style='color: inherit;' href='mailto:". $eml . "' rel='nofollow' >" . $eml . "</a>" );
	ob_start();
?>
<span id="<?= $id ?>"></span> 
<script>
  	var str = "<?= $obfeml ?>";
 	decodedstr = str.replace(/[a-zA-Z]/g, 
		function(c){
      		return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);});  
  	document.getElementById("<?= $id ?>").innerHTML = decodedstr;
	</script>
<?php
	return ob_get_clean();
}

function obfuscated_email($email_option, $id){
	echo get_obfuscated_email($email_option, $id);	
}

?>