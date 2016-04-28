var UNESCO = {};
(function() {

	var lock = false;

	var max_width = 1920;

	var resized_images_to_load = 0;

	var stop_loading_fade = false;

	var reconstructions = {};

	var reconstructions_loaded = 0;
	
	var percentage = 100;

 	var slide_index = 0;

	var initialized = false;

/*
	this.checkMobile = function(){
	
		if( PX.IsMobile ){
	
			$('body').css('width', '80%');
			$('body').css('margin-top', '20%');
				
		}
		
		this.checkOrientation();
		
	}
		
	this.checkOrientation = function() {

		var proceed = false;
		
		var ns = this;
		
		if(window.innerWidth > window.innerHeight){
			
			this.init();
			
		}
		
		$(window).on("orientationchange",function(){

			if(!initialized && window.innerWidth > window.innerHeight){
				
				ns.init();
				
			} else {
				
				this.resize();
				
			}

		});		
		
	}
*/
	 	
	this.init = function() {
		
		var ns = this;
		
		initialized = true;
		
		this.resize();
		
		$("body").css('background-image', 'url(../webgl/data/textures/background.png)');

		//ns.topStatusBar();

		$(document).on('click', ".UNESCO .arrow.up.disabled", function(e) {
			e.preventDefault();


		});

		$(document).on('click', ".UNESCO .arrow.down.disabled", function(e) {
			e.preventDefault();

		});
		
		$(document).on('click', ".UNESCO .arrow.up:not(.disabled)", function(e) {
			e.preventDefault();

			ns.slider(-1);

		});

		$(document).on('click', ".UNESCO .arrow.down:not(.disabled)", function(e) {
			e.preventDefault();

			ns.slider(1);

		});		

		function fading() {

			$(".loading").fadeTo(1000, 1, function() {

				if (!stop_loading_fade) {

					$(".loading").fadeTo(1000, 0, function() {

						if (!stop_loading_fade) {
							fading();
						}
					});
				}
			});

		}

		fading();

		$(".UNESCO .explore-button").click(function(e) {
			e.preventDefault();

			ns.hideSplash();

			ns.centerLogo();

			// Change app state to Level 0
			OnExploreClick();

		});

		$(".UNESCO #zoom-in-button").click(function(e) {
			e.preventDefault();
			ns.hideZoomIn();
			ZoomInFromLevel0ToLevel1(false);

		});

		$(".UNESCO #zoom-out-button").click(function(e) {
			e.preventDefault();
			ns.hideZoomOut();
			ZoomOutFromLevel1ToLevel0(false);

		});

		$(document).on('click', ".UNESCO#browse .item.selected a", function(e) {
			e.preventDefault();
			
			ns.itemClicked();

		});
		
		$(document).on('click', ".UNESCO#browse .item:not(.selected) a", function(e) {
			e.preventDefault();
			
			var browse = $(".UNESCO#browse");
			
			var old_selected = browse.find(".item.selected");
			var item = $(this).closest('.item.show');
			
			old_selected.removeClass('selected');
			
			item.addClass('selected');
			
			var old_index = old_selected.index( "#browse .item.show" );
			
			var item_index = item.index( "#browse .item.show" );
			
			var index_diff = item_index - old_index;
			
			var item_height = item.height();
			
			var item_margin = parseInt(item.css('margin-bottom'), 10);
			
			var old_top = parseInt(browse.find(".items-inner").css('top'), 10);
			
			console.log(old_top);
			
			new_top = old_top - ((item_height + item_margin) * index_diff);
			
			console.log(new_top);
			
			browse.find(".items-inner").css('top', new_top + 'px');
			
			ns.setArrows();
			
			ns.itemClicked();

		});

		$(document).on('click', ".UNESCO#slide-5 .magnify, .UNESCO#slide-5 .thumbnail", function(e) {
			e.preventDefault();

			$(".UNESCO#slide-5").hide();
			
			$(".UNESCO.close-button").show();
			
			$(".UNESCO#slide-9").show();

			Params.MainScene = false;

			if( !modelRenderer )
            {
			    var modelContainer = $(".UNESCO#slide-9 #glModelContainer");
                console.log( "+--+  Create Model Renderer (on click)" );
				modelRenderer = new PX.ModelRenderer();
			    modelRenderer.Init(modelContainer[0], windowWidth, windowHeight);
			}

			// @NOTE: We do not pass filename extension. That's added internally in the Loaders
            /*var modelIndex = 15;
            
            if( PX.ModelNames[ modelIndex ].length > 0 )
            {

                    modelRenderer.Load( PX.ModelRootPath + PX.ModelPaths[ modelIndex ], PX.ModelNames[ modelIndex ], function( per ) {                 
		            //console.log("+---+  Loading: " + parseInt(per * 100.0) + "%" );
	            	});
            }
            else
            {
                console.log( "****  3d Model not available. Index: ", (modelIndex+1) );
            }
            */
           
			var folder =  $("#slide-5 .entry").attr('folder');
			//webgl/data/models/16_Lion_of_Mosul/16_lion3
			var filename = $("#slide-5 .entry").attr('filename');
            modelRenderer.Load( PX.ModelRootPath + folder + "/", filename, function( per ) {	
            	//console.log("+---+  Loading: " + parseInt(per * 100.0) + "%" );
        	});
            
		});

		$(".UNESCO#share-button").click(function(e) {
			e.preventDefault();

			var menu = $(".UNESCO.share-menu");

			if (menu.css('display') == 'none') {
				menu.fadeTo(1000, 1);
			} else {
				menu.fadeTo(1000, 0);
			}

		});

		$(".UNESCO#menu-button").click(function(e) {
			e.preventDefault();

			$(".UNESCO.furniture").hide();

			ns.overlayAppend();
			ns.center($(".UNESCO#about"));

			//ns.centerLogo();

			$(".UNESCO.close-button").show();

		});

		$(".close-button").click(function(e) {
			e.preventDefault();

			ns.overlayRemove();
			
			if($(".UNESCO#about").css('display') == 'block'){
				
				$(".UNESCO#about").hide();
				$(".UNESCO.furniture").show();
				$(this).hide();
			} else if($(".UNESCO#slide-5").css('display') == 'block'){
				$(".UNESCO#slide-5").hide();
				
				ns.resetContainer();
				
				$(".UNESCO.furniture").show();
				$(".UNESCO#browse").show();
				$(this).hide();
				
			} else if($(".UNESCO#slide-9").css('display') == 'block'){
				
				ns.resetContainer();
				
				$(".preloaderBG").hide();
				$(".preloaderFG").hide();
				modelRenderer.Clear();
				Params.MainScene = true;
				$(".UNESCO#slide-9").hide();
				$(".UNESCO#slide-5").show();

			}
		});
			
		$(".next.disabled").click(function(e) {
			
			e.preventDefault();


		});

		$(".prev.disabled").click(function(e) {
			
			e.preventDefault();


		});		

		$(".next:not(.disabled)").click(function(e) {
			
			e.preventDefault();

			ns.next(1);
			

		});

		$(".prev:not(.disabled)").click(function(e) {
			
			e.preventDefault();

			ns.next(-1);

		});	
		
		$(document).on('click', ".readmore", function(e) {
			e.preventDefault();

			$(this).hide();
			
			var container = $(this).closest('.container');
			
			var more = $(this).closest('ul').find('.more');
			
			var more_width = more.width();
			
			var more_margin = parseInt(more.css('margin-right'), 10);
			
			var media = $(this).closest('ul').find('.media');
			
			media.find('img').attr('width', more_width);
			
			media.find('iframe').attr('width', more_width);
			

			var container_width =container.width();
			
			var new_width = container_width + (more_width * 2) + (more_margin * 2);
			
			container.css('width', new_width + 'px');
			
			$(".prev").hide();
			$(".next").hide();
	
			more.css('visibility', 'hidden');
			media.css('visibility', 'hidden');			
			
			more.show();
			media.show();

			var excerpt = container.find('.excerpt');
			
			var excerpt_offset = excerpt.offset().top;
			
			var more_offset = more.offset().top;
			
			var new_padding = excerpt_offset - more_offset;
				
						
			more.css('padding-top', new_padding + 'px');
			media.css('margin-top', new_padding + 'px');			

			more.css('visibility', 'visible');
			media.css('visibility', 'visible');			
			
			$(this).closest('li').find('.collapse').show();
		});				

		$(document).on('click', ".collapse", function(e) {
			e.preventDefault();

			ns.resetContainer();
			
		});		
		
	}

	this.itemClicked = function(){
		
		var ns = this;
		
		var entry = $('#browse .item.selected .container').html();
			
		$('#slide-5 .container').html(entry);
		
		ns.resize('#slide-5 .container ul');
	
		$(".UNESCO#browse").hide();

		$(".UNESCO#menu-button").hide();
		$(".UNESCO.furniture").hide();
		$(".UNESCO.close-button").show();
		
		var idx = $(".item.selected").index( "#browse .item.show" );
				
		slide_index = idx;
		
		nextitem = ns.nextItem(-1, idx);
		
		if(!nextitem.length){
			$(".prev").addClass('disabled');	
		} else {
			$(".prev").removeClass('disabled');	
		}
		
		nextitem = ns.nextItem(1, idx);
		
		if(!nextitem.length){
			$(".next").addClass('disabled');	
		} else {
			$(".next").removeClass('disabled');	
		}
		
		$(".UNESCO#slide-5").show();
	}
	
	this.next = function(direction){
		
		var ns = this;
		
		var idx = slide_index;
		
		nextitem = ns.nextItem(direction, idx);
		
		if (nextitem.length) {
				
			var entry = nextitem.find('.container').html();
			
			$('#slide-5 .container').fadeOut('fast', function(){
				
				$(this).html(entry);
				
				idx = ns.nextIndex(direction, idx);
						
				nextitem = ns.nextItem(direction, idx);
				
				if(!nextitem.length && direction == -1){
					$(".prev").addClass('disabled');	
						
				}
				if(!nextitem.length && direction == 1){ 
					$(".next").addClass('disabled');
				}				
				
				if(direction == -1){
					
					$(".next").removeClass('disabled');	
				
				}
				
				if(direction == 1){
					$(".prev").removeClass('disabled');		
				}	
								
				slide_index = idx;
								
				ns.resize('#slide-5 .container ul');
								
				$('#slide-5 .container').fadeIn('fast');
				
			});
			
			
		}
	}
	

	this.nextItem = function(direction, idx){
		
		var ns = this;
		
		idx = ns.nextIndex(direction, idx);

		if(idx < 0){
			return {};
		}	
		
		if(idx == $("#browse .item.show").length){
			return {};	
		}
		
		var nextitem = $("#browse .item.show:eq(" + idx + ")");
		
		return nextitem;
	}
	
	this.nextIndex = function(direction, idx){
		
		var ns = this;
		
		if (direction == -1) {
			
			idx--;
				
		} else {

			idx++;

		}
		
		return idx;
		
	}	
		
	this.resetContainer = function(){
		
		var ns = this;
		
		if($('#slide-5 .collapse').css('display') == 'block'){
			
			var container = $('#slide-5 .container');
			
			var more = container.find('.more');
			
			var media = container.find('.media');
	
			var more_width = more.width();
			
			var more_margin = parseInt(more.css('margin-right'), 10);
			
			var container_width = container.width();
			
			var new_width = container_width - (more_width * 2) - (more_margin * 2);
			
			container.css('width', new_width + 'px');
	
			more.hide();
			
			media.hide();
			
			more.css('padding-top', '0');
			
			media.css('margin-top', '0');
			
			$(".prev").show();
			$(".next").show();
			
			container.find('.readmore').show();
			
			container.find('.collapse').hide();
			
		}			
	}
	
	this.slider = function(direction) {

		var ns = this;

		var slider = $(".UNESCO .items-inner");

		var top = parseInt(slider.css('top'), 10);

		var item = slider.find('.item.show.selected');

		var item_height = item.height();

		var item_margin_bottom = parseInt(slider.find('.item').css('margin-bottom'), 10);

		var item_set_height = (item_height + item_margin_bottom + 1) * 1;

		var limit = 0;

		var adder = "+=";

		if (direction == -1) {

			var height = slider.height();
			limit = (height * -1) + (item_set_height * 2) ;
			adder = "-=";
		}

		if (!lock){
			
			if ((direction == -1 && top <= item_set_height && top > limit) || (direction == 1 && top < (item_set_height))) {

				lock = true;
	
				slider.animate({
					top : adder + item_set_height,
				}, 1000, function() {
	
					ns.select(direction, item);
	
					lock = false;
				});
				
			} else {
				
				ns.select(direction, item);
				
			}
		}

	}

	this.select = function(direction, item) {

		var ns = this;
		
		var idx = item.index( "#browse .item.show" );
		
		if (direction == -1) {
			
			idx++;
				
		} else {

			idx--;

		}
		
		var nextitem = $("#browse .item.show:eq(" + idx + ")");
		
		if (nextitem) {
	
			item.removeClass('selected');
			
			nextitem.addClass('selected');
			
			//var idx = ns.nextIndex(direction * -1, idx);
			
			console.log(nextitem);
			
			ns.setArrows();
			
		} 
	}
	
	this.setArrows = function() {
		
		var idx = $("#browse .item.show.selected").index( "#browse .item.show");
		
		console.log($("#browse .item.show.selected"));
		
		console.log(idx);
		
		console.log($("#browse .item.show").length);
		
		if(idx == 0){
		
			$(".arrow.down").addClass('disabled');
		
		}else{
			
			$(".arrow.down").removeClass('disabled');
		}
			
		if(idx + 1 == $("#browse .item.show").length){
		
			$(".arrow.up").addClass('disabled');
		
		}else{
			
			$(".arrow.up").removeClass('disabled');
		}
		
	}

	this.resize = function(selector, callback) {

		var ns = this;

		var window_width = window.innerWidth;

		if (window_width >= max_width) {
			percentage = 100;
		} else {
			percentage = (window_width * 100) / max_width;
		}

		function apply(elm, target) {

			if (elm.hasClass('resize-' + target)) {

				var old_attr = elm.css(target);

				attr = parseInt(old_attr, 10) * .01 * percentage;
				
				if(attr){
					
					elm.css(target, attr + 'px');
				}
				
			}

		}

		if(!selector){
			selector = "body";
		}
		
		
		resized_images_to_load = $(selector).find("img.resize").length;

		function afterLoad(img) {

			var attr = img[0].naturalWidth;

			var attr = attr * .01 * percentage;

			img.prop('width', attr);

			var attr = img[0].naturalHeight;

			var attr = attr * .01 * percentage;

			img.prop('height', attr);

			resized_images_to_load--;

			if (resized_images_to_load == 0) {

				if(selector == 'body'){
					ns.afterLoadImages();
				}
			}

		}

		if(!selector){
			selector = "body";
		}
				
		$(selector).find("[class*=resize]").each(function() {

			if ($(this).hasClass('resize')) {

				if ($(this).is('img')) {

					//check if the image is already on cache
					if ($(this).prop('complete')) {

						afterLoad($(this));

					} else {
						/* Call the codes/function after the image is loaded */
						$(this).on('load', function() {

							afterLoad($(this));

						});
					}

				} else {

					$(this).addClass('resize-width');
					$(this).addClass('resize-height');
				}

			}

			apply($(this), 'width');
			apply($(this), 'height');
			apply($(this), 'top');
			apply($(this), 'left');
			apply($(this), 'right');
			apply($(this), 'bottom');
			apply($(this), 'font-size');
			apply($(this), 'margin-top');
			apply($(this), 'margin-bottom');
			apply($(this), 'margin-right');
			apply($(this), 'margin-left');
			apply($(this), 'padding-top');

		});

	}

	this.center = function(elm) {

		this.centerPrep(elm);
		this.centerVertical(elm);
		this.centerHorizontal(elm);

	}

	this.centerPrep = function(elm) {

		elm.css('position', 'absolute');

		elm.css('visibility', 'hidden');

		elm.parent().show();

		elm.show();

	}

	this.centerVertical = function(elm) {

		this.centerPrep(elm);

		//HEIGHT
		var height = elm.height();

		var window_height = window.innerHeight;

		var offset = height / 2;

		var middle = window_height / 2;

		var top = middle - offset;

		elm.css('top', top + 'px');

	}

	this.centerHorizontal = function(elm) {

		this.centerPrep(elm);

		//WIDTH
		var width = elm.width();

		var window_width = window.innerWidth;

		var offset = width / 2;

		var middle = window_width / 2;

		var left = middle - offset;

		elm.css('left', left + 'px');

		elm.css('visibility', 'visible');

	}
	/*
	 this.topStatusBar = function() {

	 var ns = this;

	 var elm = $(".UNESCO .status-bar-top");

	 elm.show();

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

	 elm.show();

	 var status_bar_bottom_max_height = 111;

	 var new_height = (percentage * .01) * status_bar_bottom_max_height;

	 elm.css('height', new_height + 'px');

	 }
	 */

	this.showExploreButton = function() {

		var img = new Image();
		img.onload = function() {
		
			stop_loading_fade = true;
	
			$(".UNESCO .loading").hide();
	
			var exploreButton = $(".UNESCO .explore-button");
			exploreButton.css('display', 'block');
			exploreButton.css('opacity', 0.0);
			exploreButton.fadeTo(1000, 1);
	
			//this.bottomStatusBar(100);
		
		};
		img.src = "../img/splash/explore-button.png";

	}

	this.hideSplash = function() {

		$(".UNESCO#splash").hide();
		$(".UNESCO.furniture").show();

	}

	this.showBrowse = function(location_id) {

		var ns = this;
		
		var elm = $(".UNESCO#browse");

		var images = elm.find(".container .slide-image img");
		
		var images_count = 0;
		
		images.each(function(){
			
			if ($(this).prop('complete')) {

				images_count++;
				
				if (images_count == images.length) {
					ns.finishShowBrowse(location_id);
				}	
				
			} else {
				
				$(this).on('load', function() {

					images_count++;
										
					if (images_count == images.length) {
						ns.finishShowBrowse(location_id);
					}
					
				});
			}

			
			
		});

	}
	
	this.finishShowBrowse = function(location_id){
		
		var ns = this;
		
		var elm = $(".UNESCO#browse");
						
		elm.attr('location-id', location_id);

		var status_selector = "";

		var status = elm.attr('status');

		if (status) {
			status_selector = '[status="' + status + '"]';
		}

		elm.find(".item").removeClass('show');

		var selector = ".item[location-id=" + location_id + "]";

		var filtered_selector = selector + status_selector;

		var selected = elm.find(filtered_selector)

		if (selected.length) {

			selected.addClass('show');

		} else {

			selected = elm.find(selector);

			$("#legend > .clr > li > a").addClass('disabled').removeClass('clickable');
			UpdateFilterSwitches(3);
			locationMarkers.FilterLocationMeshColors(WebpageStates.FilterSwitches);
			elm.attr('status', "");

			selected.addClass('show');

		}

		ns.legendUnclickable(elm, selector, 'Destroyed');
		ns.legendUnclickable(elm, selector, 'UnderReconstruction');
		ns.legendUnclickable(elm, selector, 'Reconstructed');

		elm.find(".items .item").removeClass('selected');
		
		var item = elm.find(".items .item.show:eq(0)");

		item.addClass('selected');

		elm.show();
				
		var item_height = item.height();
		
		var item_margin = parseInt(item.css('margin-bottom'), 10);
		
		var new_top = item_height + item_margin;
		
		elm.find(".items-inner").css('top', new_top + 'px');

		$(".arrow.down").addClass('disabled');
		
		if(elm.find(".items-inner .item.show").length == 1){

			$(".arrow.up").addClass('disabled');		
		}
		
		
			
		
	}

	this.legendUnclickable = function(elm, selector, filter) {

		selector += '[status="' + filter + '"]';

		if (!elm.find(selector).length) {
			$("#legend a[status=" + filter + "]").removeClass('clickable').addClass('disabled');

		}

	}

	this.filtersOff = function(elm) {

		var status = elm.attr('status');
		
		var off = true;
		
		var on = 0;
		
		$("#legend a:not([status=" + status + "])").each(function(){
			
			if(!$(this).hasClass('disabled')){
				
				off = false;	
				on++;
			}
						
		});
		
		if(off){
			
			$("#legend a").addClass('clickable');	
			$("#legend a").removeClass('disabled');		
			
			$("#browse").attr('status', "");
			
			index = 3;
		} else if(on == 2){
			
			$("#legend a:not([status=" + status + "])").addClass('disabled');		
			
			$("#browse").attr('status', "status");
			
			var index = elm.parent().index();
			
		}
		
    	UpdateFilterSwitches( index );
    	locationMarkers.FilterLocationMeshColors( WebpageStates.FilterSwitches );		
		
	}
	this.hideZoomIn = function() {

		var elm = $("#zoom-in-button");

		elm.hide();

	}

	this.hideZoomOut = function() {

		var elm = $("#zoom-out-button");

		elm.hide();

	}

	this.showZoomIn = function() {

		var elm = $("#zoom-in-button");

		elm.show();

	}

	this.showZoomOut = function() {

		var elm = $("#zoom-out-button");

		elm.show();

	}
	this.hideBrowse = function() {

		$(".UNESCO#browse").hide();

	}

	this.showLegend = function() {

		var elm = $(".UNESCO#legend");

		elm.show();

	}

	this.hideLegend = function() {

		$(".UNESCO#legend").hide();

	}

	this.afterLoadImages = function() {

		var ns = this;

		/*
		$("#browse li.text").each(function() {

			var elm = $(this);
			var sibling_height = elm.parent().find("li.image img").height();
			elm.css('height', sibling_height + 'px');

		});
		*/
		
		ns.center($("#splash"));

	}

	this.overlayAppend = function() {

		$("body").append('<div id="overlay"></div>');

	}

	this.overlayRemove = function() {

		$("#overlay").remove();

	}

	this.centerLogo = function() {

		this.centerHorizontal($("#logo"));

	}

	this.changeLevel2SelectedMarker = function(colorHex) {
		if (locationMarkers.clickedMarkerIndex && appStateMan.IsState(PX.AppStates.AppStateLevel2)) {
			locationMarkers.markers[locationMarkers.clickedMarkerIndex].targetColor.set(colorHex);
		}
	}

	this.buildBrowse = function(callback) {

		var ns = this;

		//read through reconstructions.json
		var url = "webgl/data/reconstructions.json";

		$.ajax({
			dataType : "json",
			url : url,
			success : function(data) {

				ns.processItems(data, callback);
			},
			error : function(data) {

				ns.processItems(data, callback);
			}
		});

	}

	this.processItems = function(data, callback) {

		var ns = this;

		reconstructions = data.responseText;
		if (!reconstructions) {
			reconstructions = data;
		}

		var items = [];

		$.each(reconstructions, function(key, val) {

			var details = val.details;

			var url = "details/" + details + "/data.json";

			if (details) {

				$.ajax({
					dataType : "json",
					url : url,
					success : function(data) {

						ns.processItem(data, key, val, callback);
					},
					error : function(data) {

						ns.processItem(data, key, val, callback);
					}
				});

			} else {

				ns.buildItem(key, val, callback);

			}

		});

	}

	this.processItem = function(data, key, val, callback) {

		var ns = this;

		item = data.responseText;
		if (!item) {
			item = data;
		}

		//model file name
		val.filename = item.filename;

		//date_constructed
		val.date_constructed = item.date_constructed;

		//date_destroyed
		val.date_destroyed = item.date_destroyed;

		//images
		val.images = item.images;

		//videos
		val.videos = item.videos;
		
		
		//get copy	
		var url = "details/" + val.details + "/copy.html";
			
		$.ajax({
			url : url,
			success : function(data) {

				ns.getCopy(data, key, val, callback);
			},
			error : function(data) {

				ns.getCopy(data, key, val, callback);
			}
		});
		
	}
	
	this.getCopy = function(data, key, val, callback) {

		var ns = this;

		copy = data.responseText;
		if (!copy) {
			copy = data;
		}
		
		//get first paragraph (excerpt)
		var body = $("<div>" + copy + "</div>");
		
		var excerpt = body.find('p').first().html();
		
		//get rest (more)
		body.find('p').first().remove();
		
		var more = body.html();
		
		val.excerpt = excerpt;
		
		val.more = more;
		
		ns.buildItem(key, val, callback);

	}	

	this.buildItem = function(item_key, item, callback) {

		var ns = this;

		var content = $("#browse .items .clone").clone();

		content.removeClass('clone');

		content.attr('item-id', item.id);

		content.attr('location-id', item.location_id);

		content.find(".title .name").html(item.name);

		var status = 'Destroyed';

		if (item.details) {

			content.find('.entry').attr('folder', item.details);

			if (item.images && item.images.length) {
				status = 'Under Reconstruction';
			}

			if (item.filename) {
				content.find('.entry').attr('filename', item.filename);
				status = 'Reconstructed';
			}

			content.find(".image img").attr('src', 'details/' + item.details + '/image.png');
			content.find(".slide-image img").attr('src', 'details/' + item.details + '/image.png');

			if (item.date_created && item.date_destroyed) {
				content.find(".date").html(item.date_created + ' - ' + item.date_destroyed);
			}

			var p = item.images;

			for (var key in p) {
				if (p.hasOwnProperty(key)) {
					//p[key]

					var obj = p[key];
					var output = obj[Object.keys(obj)[0]];

					content.find(".entry .images").append('<img src="details/' + item.details + '/images/' + output + '" />');
				}
			}

			p = item.videos;

			for (var key in p) {
				if (p.hasOwnProperty(key)) {
					//p[key]
					var obj = p[key];
					var output = obj[Object.keys(obj)[0]];

					content.find(".entry .videos").append('<iframe width="420" height="315" src="' + output + '" frameborder="0" allowfullscreen=""></iframe>');
				}
			}
			
			if(!item.excerpt){
				
				item.excerpt = "<p>This information hasn't been written yet. Join us to get involved.</p>"
				
			}
			
			content.find(".entry .excerpt").html(item.excerpt);
			
			if(item.more){
				content.find(".entry .more").html(item.more);
			}
		}

		content.find(".status").html(status);
		content.attr("status", status.replace(' ', ''));

		//console.log("name: " + item.name + " loc: " + item.location_id + " status: " + status);
		
		
		$("#browse .items .items-inner").append(content);

		//add to browse

		reconstructions_loaded++;

		reconstructions[item_key].status = status;

		if (reconstructions_loaded == reconstructions.length) {
			
			callback();
			
		}

	}

	this.reconstructions = function() {
		return reconstructions;
	}

	this.ajaxJSON = function(url, callback) {

		$.ajax({
			dataType : "json",
			url : url,
			success : function(json) {
				callback(json);
			},
			error : function(data) {
				callback(json);
			}
		});

	}

	this.legendClickable = function() {

		$("#legend > .clr > li > a").addClass('clickable');

	}
}).apply(UNESCO);

var img = new Image();
img.onload = function() {

	$(document).ready(function() {

		//UNESCO.checkMobile();
		UNESCO.init();

	});

};
img.onerror = function() {
};
img.src = "../webgl/data/textures/background.png";

