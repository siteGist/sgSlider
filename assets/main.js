$(document).ready(function(){
	var snippetOption = {style:"matlab",showNum:false};
	$("pre.js").snippet("javascript",snippetOption);
	$("pre.html").snippet("xml",snippetOption);
	$("pre.css").snippet("css",snippetOption);
	$("pre.expandableHtml").snippet("xml",{style:"matlab",showNum:false,collapse:true});
	
	$('h3.expandable').click(function(){
		var $text = $(this).next('article.h3text');
		var height = $text.css({'height':'auto'}).height(); $text.css({'height':0});

		$('article.h3text').not($text).stop(true,true).animate({height:0},1777).removeClass('expanded');
		if( $text.hasClass('expanded') ) {
			$text.css({height:height}).stop(true,true).animate({height:0},1777).removeClass('expanded');
		} else {
			$text.stop(true,true).animate({height:height},1777,function(){ $(this).css({'height':'auto'}).addClass('expanded'); });
		}
	});
});