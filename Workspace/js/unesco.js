var UNESCO = {};
(function() {

	var lock = false;
	
	this.init = function() {

		var ns = this;
		
		//this.hideSplash();
		//this.showBrowse();
		
		//ns.topStatusBar();
		//var slider = $(".UNESCO .items-inner-2");
		//var item_height = 250;
		
		var max_width = 1920;
		
		var window_width = window.innerWidth;
		
		if(window_width >= max_width){
			var percentage = 100;
		} else {
			var percentage = (window_width * 100) / max_width;
		}
		
		$("span.resize img").css('width', percentage + "%");
		
		$("a.resize").each(function(){
			
			var width = $(this).width();
			var height = $(this).height();
			
			width = width * .01 * percentage;
			
			height = height * .01 * percentage; 
			
			$(this).css('width', width + 'px');
			$(this).css('height', height + 'px');
			
		});
		
		$("a.resize-margin-top").each(function(){
			
			var marginTop = $(this).css('marginTop');
			
			marginTop = parseInt(marginTop, 10) * .01 * percentage;
			
			$(this).css('marginTop', marginTop + 'px');
			
		});
		
		var img = document.getElementById('splash-text'); 
		
		var splash_text_height = img.clientHeight;
		
		var window_height = window.innerHeight;
		
		var offset = splash_text_height / 2;
		
		var middle = window_height / 2;
		
		var top = middle - offset;

		$(".UNESCO#splash").css('top', top + 'px');
		
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
			
            // Change app state to Level 0
            OnExploreClick();
		});	
		
		
		$(".UNESCO#slide-9 .close-button").click(function(e) {
			e.preventDefault();
			
			$(".UNESCO#slide-5").show();
			$(".UNESCO#slide-9").hide();

            // On close, clean up the model Renderer			
            Params.MainScene = true;
            if( modelRenderer )
            {
                modelRenderer.Clear();
            }

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

            Params.MainScene = false;

			var modelContainer = $(".UNESCO#slide-9 #glModelContainer");
            if( !modelRenderer )
            {
                modelRenderer = new PX.ModelRenderer();
                modelRenderer.Init( modelContainer[0], windowWidth, windowHeight );
            }

            modelRenderer.Load( "webgl/data/models/06_Mihrab_of_the_Mosque_Al_Hasan/", "mesh.js",
            function( per )
            {
                console.log( "+---+  Loading: ", per );
            });

		});					
		
	}

/*
	this.topStatusBar = function() {

		var ns = this;
		
		var elm = $(".UNESCO .status-bar-top");
		
		var status_bar_top_max_height = 44;
		
		elm.animate({
			height : "+=" + status_bar_top_max_height,
		}, 1000, function() {
			
			
			if($(".UNESCO#splash .explore-button").css('display') != 'block'){
				elm.css('height', '0px');
			
				ns.topStatusBar();
			} else {
				elm.css('height', status_bar_top_max_height +'px');
				
			}

		});

	}
	
	this.bottomStatusBar = function(percentage) {

		var ns = this;
		
		var elm = $(".UNESCO .status-bar-bottom");
		
		var status_bar_bottom_max_height = 111;
		
		var new_height = (percentage * .01) * status_bar_bottom_max_height;
		
		elm.css('height', new_height + 'px');
		
	}	
	
*/

	this.showExploreButton = function() {

        var exploreButton = $(".UNESCO .explore-button");
		exploreButton.css('display', 'block');
        exploreButton.css('opacity', 0.0 );
		exploreButton.fadeTo(1000, 1);

		//this.bottomStatusBar(100);

	}

	this.hideSplash = function() {

		$(".UNESCO#splash").hide();
		$(".UNESCO.furniture").show();
		
	}

	this.showBrowse = function() {

		var elm = $(".UNESCO#browse");
		
		/*
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
		*/
		elm.show();

	}
	
	this.hideBrowse = function() {

		
		$(".UNESCO#browse").hide();

	}
		
}).apply(UNESCO);




$(document).ready(function(){

	UNESCO.init();
	
});