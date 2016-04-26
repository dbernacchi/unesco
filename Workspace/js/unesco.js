var UNESCO = {};
(function() {

	var lock = false;

	var max_width = 1920;

	var resized_images_to_load = 0;

	var stop_loading_fade = false;

	var reconstructions = {};

	var reconstructions_loaded = 0;

	this.init = function() {

		var ns = this;

		this.resize();

		$("body").css('background-image', 'url(../webgl/data/textures/background.png)');

		//ns.topStatusBar();

		//$(".UNESCO#slide-5").show();

		$(".UNESCO .arrow.up").click(function(e) {
			e.preventDefault();

			ns.slider(1);

		});

		$(".UNESCO .arrow.down").click(function(e) {
			e.preventDefault();

			ns.slider(-1);

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

		/*
		 $(".UNESCO#slide-9 .close-button").click(function(e) {
		 e.preventDefault();

		 $(".UNESCO#slide-5").show();
		 $(".UNESCO#slide-9").hide();

		 // On close, clean up the model Renderer
		 Params.MainScene = true;
		 if (modelRenderer) {
		 modelRenderer.Clear();
		 }

		 });

		 $(".UNESCO#slide-5 .close-button").click(function(e) {
		 e.preventDefault();

		 $(".UNESCO#slide-5").hide();

		 $(".UNESCO#menu-button").show();
		 $(".UNESCO#browse").show();

		 });

		 */

		$(".UNESCO#browse .item.selected a").click(function(e) {
			e.preventDefault();

			$(".UNESCO#browse").hide();

			$(".UNESCO#menu-button").hide();

			ns.center($(".UNESCO#slide-5 ul"));

		});

		$(".UNESCO#slide-5 .magnify").click(function(e) {
			e.preventDefault();

			$(".UNESCO#slide-5").hide();
			$(".UNESCO#slide-9").show();

			Params.MainScene = false;

			var modelContainer = $(".UNESCO#slide-9 #glModelContainer");
			if (!modelRenderer) {
				modelRenderer = new PX.ModelRenderer();
				modelRenderer.Init(modelContainer[0], windowWidth, windowHeight);
			}

			// @NOTE: We do not pass filename extension. That's added internally in the Loaders
			//modelRenderer.Load("webgl/data/models/01_Nimrud_Relief/", "Nimrud", function( per )
			//modelRenderer.Load("webgl/data/models/05_Hatra_Relief/", "05_Hatra_relief2", function( per )
			//modelRenderer.Load("webgl/data/models/03_Stela_7/", "03_Stela_7", function( per )
			modelRenderer.Load("webgl/data/models/16_Lion_of_Mosul/", "16_lion2", function(per) {
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
			$(".UNESCO#about").hide();
			$(".UNESCO.furniture").show();

			$(this).hide();

		});

	}
	
	this.slider = function(direction) {

		var slider = $(".UNESCO .items-inner");
		
		var top = parseInt(slider.css('top'), 10);

		var item = slider.find('.item.show');
		
		item.removeClass('selected');
		
		var item_height = item.height();

		var item_margin_bottom = parseInt(slider.find('.item').css('margin-bottom'), 10);

		var item_set_height = (item_height + item_margin_bottom) * 1;

		var limit = 0;

		var adder = "+=";

		if (direction == -1) {

			var height = slider.height();
			limit = (height * -1) + (item_set_height);
			adder = "-=";
		}

		if (!lock && ((direction == -1 && top <= 0 && top > limit) || (direction == 1 && top < 0))) {

			lock = true;

			slider.animate({
				top : adder + item_set_height,
			}, 1000, function() {

				item.removeClass('selected');
				
				if(direction == -1){
					
					item.next().addClass('selected');
				} else {
					
					item.prev().addClass('selected');
					
				}
								
				lock = false;
			});
		}

	}


	this.resize = function() {

		var ns = this;

		var window_width = window.innerWidth;

		if (window_width >= max_width) {
			var percentage = 100;
		} else {
			var percentage = (window_width * 100) / max_width;
		}

		function apply(elm, target) {

			if (elm.hasClass('resize-' + target)) {

				var attr = elm.css(target);

				attr = parseInt(attr, 10) * .01 * percentage;

				elm.css(target, attr + 'px');

			}

		}

		resized_images_to_load = $("img.resize").length;

		function afterLoad(img) {

			var attr = img[0].naturalWidth;

			var attr = attr * .01 * percentage;

			img.prop('width', attr);

			var attr = img[0].naturalHeight;

			var attr = attr * .01 * percentage;

			img.prop('height', attr);

			resized_images_to_load--;

			if (resized_images_to_load == 0) {

				ns.afterLoadImages();
			}

		}


		$("[class*=resize]").each(function() {

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

		stop_loading_fade = true;

		$(".UNESCO .loading").hide();

		var exploreButton = $(".UNESCO .explore-button");
		exploreButton.css('display', 'block');
		exploreButton.css('opacity', 0.0);
		exploreButton.fadeTo(1000, 1);

		//this.bottomStatusBar(100);

	}

	this.hideSplash = function() {

		$(".UNESCO#splash").hide();
		$(".UNESCO.furniture").show();

	}

	this.showBrowse = function(location_id) {

		var elm = $(".UNESCO#browse");

		elm.find(".items-inner").css('top', '0');
		
		elm.attr('location-id', location_id);
		
		var status_selector = "";
		
		var status = elm.attr('status');
		
		if(status){
			status_selector = '[status="' + status + '"]';
		}
		
		elm.find(".item").removeClass('show');
		
		var selector = ".item[location-id=" + location_id + "]";
		
		var filtered_selector = selector + status_selector;
		
        var selected = elm.find(filtered_selector)
        
        if(selected.length){ 
        	
        	selected.addClass('show');
        	
		} else {
			
			selected = elm.find(selector);
			
			$("#legend > .clr > li > a" ).addClass('disabled').removeClass('clickable');
			UpdateFilterSwitches( 3 );
            locationMarkers.FilterLocationMeshColors( WebpageStates.FilterSwitches );				
			elm.attr('status', "");
		
		
			selected.addClass('show');
			
		}
		
		this.legendUnclickable(elm, selector,'Destroyed');
		this.legendUnclickable(elm, selector,'UnderReconstruction');
		this.legendUnclickable(elm, selector,'Reconstructed');
		

		elm.show();

	}
	
	this.legendUnclickable = function(elm, selector, filter){
		
		selector += '[status="' + filter + '"]';
		
		console.log(selector);
	
		if(!elm.find(selector).length){
			$("#legend a[status=" + filter + "]").removeClass('clickable').addClass('disabled');
		
		}
						
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

		$("#browse li.text").each(function() {

			var elm = $(this);
			var sibling_height = elm.parent().find("li.image img").height();
			elm.css('height', sibling_height + 'px');

		});

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

			content.attr('folder', item.details);

			if (item.images && item.images.length) {
				status = 'Under Reconstruction';
			}

			if (item.filename) {
				content.attr('filename', item.filename);
				status = 'Reconstructed';
			}

			content.find(".image img").attr('src', 'details/' + item.details + '/image.png');

			if(item.date_created && item.date_destroyed){
				content.find(".date").html(item.date_created + ' - ' + item.date_destroyed);
			}
			
			var p = item.images;

			for (var key in p) {
				if (p.hasOwnProperty(key)) {
					//p[key]

					var obj = p[key];
					var output = obj[Object.keys(obj)[0]];

					content.find(".media .images").append('<img src="details/' + item.details + '/images/' + output + '" />');
				}
			}

			p = item.videos;

			for (var key in p) {
				if (p.hasOwnProperty(key)) {
					//p[key]
					var obj = p[key];
					var output = obj[Object.keys(obj)[0]];

					content.find(".media .videos").append('<iframe width="420" height="315" src="' + output + '" frameborder="0" allowfullscreen=""></iframe>');
				}
			}

		}

		content.find(".status").html(status);
		content.attr("status", status.replace(' ', ''));

		$("#browse .items .items-inner").append(content);

		//add to browse

		reconstructions_loaded++;

		reconstructions[item_key].status = status;
		
		if (reconstructions_loaded == reconstructions.length) {

			$("#browse .items .item.show:eq(1)").addClass('selected');

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

	this.legendClickable = function(){
		
		$("#legend > .clr > li > a" ).addClass('clickable');
		
	}

}).apply(UNESCO);

var img = new Image();
img.onload = function() {

	$(document).ready(function() {

		UNESCO.init();

	});

};
img.onerror = function() {
};
img.src = "../webgl/data/textures/background.png";

