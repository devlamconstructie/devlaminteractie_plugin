<?php
	
    /** loops through array of tool taxonomy objects 
     * calling dvi_get_tool_html for each.
     * @param array tool taxonomy object.
     * @uses dvi_get_tool_html
     */
	function dvi_showcase_toolkit($tools){
		
        if (!$tools )
			$tools = dvi_get_tools();      
            
		foreach($tools as $tool):
			echo dvi_get_tool_html($tool);	
		endforeach;
		
	}
	
    /** returns html for a tool taxonomy object */
	function dvi_get_tool_html($tool){
	
		if(! is_object($tool)){
			return;
		}
		static $i;
		$i++;
		$description = sprintf('lees meer over %s', $tool->name);
		ob_start();?>

			<div id="tool_tag__<?=$i?>" class="tool-tag__ rough_wrapper preset_lightpurple_thincross">
			<a class="xp-tag__link" href="<?= trailingslashit(home_url()) .  'tool/' . $tool->slug ?>" alt='<?= $description ?>' title='<?= $description ?>' class="xp_link">
				
			
				<?php echo dvi_get_toollogo_by_id('tools', $tool->term_id, 'logo','pfi__toollogo', $i, $tool->name . ' logo.') ?>
				<?=$tool->name?>
			</a>
	
				
		</div>

	<?php
		return ob_get_clean();		
	}


	function dvi_get_tools(...$toolnames){
		return get_terms(['taxonomy' => 'tool', 'name'=> [...$toolnames] ,'hide_empty' => false]);
	}

	function dvi_get_toollogo_by_id($taxonomy, $term_id, $fieldname,$classname="", $iterator, $alttext){

		$termlogoguid = get_term_meta($term_id, 'logo')[0]['guid'];
		if(strpos($termlogoguid, '.svg')){
			  $termlogo = file_get_contents($termlogoguid);
			/* in order for the rough JS drawings to come out looking uniform, 
			we need to normalize their sizes. Since I don't want to have to go through each file to manually edit them,
			I just quickly run through them here. */
			  $termlogo =  preg_replace('/width="\d+\.?\d*(px)?"/', "", $termlogo);
			  $termlogo =  preg_replace('/height="\d+\.?\d*(px)?"/', "", $termlogo);
			  $termlogo =  preg_replace('/svg/', "svg width='150px' height='150px'", $termlogo);
		} else {
			  $termlogo = wp_get_attachment_image( get_term_meta($term_id, 'logo')[0]['ID'], 'medium');
		}
		
	
		return sprintf("<figure id='%1\$s_%2\$u' alt='%4\$s' class='%1\$s'>%3\$s</figure>", $classname, $iterator, $termlogo, $alttext);
					
	}

	function pretty_var($var){
		printf('<pre>%s</pre>', var_export($var, true));	
	}	
