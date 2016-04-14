var UNESCO = {};
(function() {

	var lock = false;
	
	this.init = function() {

		var ns = this;
		
		ns.showBrowse();
		
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
		
		
		/************
		 * VICTOR, here are the events for filtering
		 ***********/
		$(".UNESCO .legend .destroyed").click(function(e) {
			e.preventDefault();
			
			//filter for destroyed
			
		});		

		$(".UNESCO .legend .under").click(function(e) {
			e.preventDefault();
			
			//filter for under reconstruction
			
		});	
		
		$(".UNESCO .legend .reconstructed").click(function(e) {
			e.preventDefault();
			
			//filter for reconstructed
			
		});			
		/************
		 * VICTOR, here the events for filtering end
		 ***********/
		
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


		$(".UNESCO#browse").show();

	}
	
	this.hideBrowse = function() {

		
		$(".UNESCO#browse").hide();

	}
		
}).apply(UNESCO);




$(document).ready(function(){

	UNESCO.init();
	
});