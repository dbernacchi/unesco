var UNESCO = {};
(function() {

	var lock = false;
	
	this.init = function() {

		var ns = this;

		var slider = $(".UNESCO .items-inner-2");
		
		var item_height = 250;
		
		$(".UNESCO .arrow.up").click(function(e) {
			e.preventDefault();
			
			var top = parseInt(slider.css('top'), 10);
			
			console.log(top);
			
			if(!ns.lock && top < 0){
				
				ns.lock = true;
				
				slider.animate({
					top : "+=" + item_height,
				}, 1000, function() {
					ns.lock = false;
				});
				
			} 
		});

		$(".UNESCO .arrow.down").click(function(e) {
			e.preventDefault();
			
			var top = parseInt(slider.css('top'), 10);
			
			var height = slider.height();
			
			var limit = (height * -1) + (item_height * 3);
			
			if(!ns.lock &&top <= 0 && top > limit){
				
				ns.lock = true;
				
				slider.animate({
					top : "-=" + item_height,
				}, 1000, function() {
					ns.lock = false;
				});
			} 
		});

	}

	this.showBrowse = function() {

		$(".UNESCO#browse").show();

	}
	
	this.hideBrowse = function() {

		$(".UNESCO#browse").hide();

	}
		
}).apply(UNESCO);




$(document).ready(function(){

	UNESCO.init();
	
});