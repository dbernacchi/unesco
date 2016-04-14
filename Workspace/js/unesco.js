var UNESCO = {};
(function() {

	var lock = false;
	
	this.init = function() {

		var ns = this;
		
		//ns.spinner();
		
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
		
		$(".UNESCO .explore-button").click(function(e) {
			e.preventDefault();
			
			ns.hideSplash();
			
		});	
		
		
		$(".UNESCO#slide-9 .close-button").click(function(e) {
			e.preventDefault();
			
			$(".UNESCO#slide-5").show();
			$(".UNESCO#slide-9").hide();
			
		});	
		
		$(".UNESCO#slide-5 .close-button").click(function(e) {
			e.preventDefault();
			
			$(".UNESCO#slide-5").hide();
			
			$(".UNESCO#menu-button").show();
			$(".UNESCO#browse").show();
			
		});			
		
		$(".UNESCO#browse .item a").click(function(e) {
			e.preventDefault();
			
			$(".UNESCO#browse").hide();
			
			$(".UNESCO#menu-button").hide();
			$(".UNESCO#close-button").show();
			
			$(".UNESCO#slide-5").show();

		});	
		
		$(".UNESCO#slide-5 .magnify").click(function(e) {
			e.preventDefault();
			
			
			$(".UNESCO#slide-5").hide();
			$(".UNESCO#slide-9").show();

		});					
		
	}

	this.spinner = function() {

		var ns = this;
		
		var elm = $(".UNESCO .status-bar-top");
		
		var status_bar_top_max_width = 162;
		
		elm.animate({
			width : "+=" + status_bar_top_max_width,
		}, 1000, function() {
			
			elm.css('width', '0px');
			
			ns.spinner();


		});

	}
	
	this.showExploreButton = function() {

		$(".UNESCO .explore-button").css('display', 'block');

	}

	this.hideSplash = function() {

		$(".UNESCO#splash").hide();
		$(".UNESCO.furniture").show();
		
	}

	this.showBrowse = function() {

		var elm = $(".UNESCO#browse");
		
		//get elm height
		var height = elm.height();
		
		//divide by two
		var offset = height / 2;
		
		//get window height
		var win_height = window.innerHeight;
		
		//divide by two
		var middle = win_height / 2;
		
		//subtract a from b
		var top = middle - offset;
		
		//set top
		elm.css('top', top + 'px');
		elm.show();

	}
	
	this.hideBrowse = function() {

		
		$(".UNESCO#browse").hide();

	}
		
}).apply(UNESCO);




$(document).ready(function(){

	UNESCO.init();
	
});