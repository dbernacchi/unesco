var UNESCO = {};
(function() {

	var lock = false;
	
	this.init = function() {

		var ns = this;
		
		//ns.topStatusBar();
		
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

            var modelContainer = document.getElementById( "glModelContainer" );
            modelContainer.style.top = "0px";
            modelContainer.style.left = "0px";
            modelContainer.style.right = "0px";
            modelContainer.style.bottom = "0px";
            if( !modelRenderer )
            {
                modelRenderer = new PX.ModelRenderer();
                modelRenderer.Init( modelContainer, windowWidth, windowHeight );
            }

            modelRenderer.Load( "webgl/data/models/06_Mihrab_of_the_Mosque_Al_Hasan/mesh.js",
            //modelRenderer.Load( "webgl/data/models/01_Nimrud_Relief/mesh.js", 
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

		$(".UNESCO .explore-button").css('display', 'block');
		//this.bottomStatusBar(100);

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