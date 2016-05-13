
var UNESCO = {};
(function() {

	var lock = false;

	var max_width = 1920;

	var resized_images_to_load = 0;

	//var stop_loading_fade = false;

	var reconstructions = {};

	var reconstructions_loaded = 0;
	
	var percentage = 100;

 	var slide_index = 0;
	 	
	var preloaded_images = 0;
	 	
	var models = {};
	
	var rekrei_images = {};
	
	this.init = function() {
		
		var ns = this;
		
		if( PX.IsMobile){
			
			if(window.innerWidth < window.innerHeight){
		
				$('body').css('width', '100%');
				
				$('body').css('overflow', 'scroll');
				
				$('body').css('margin-top', '5%');
				
				$('#portrait-warning').css('width', '100%');
				
			} else {
				
				var doc_height = $(document).height();
				
				var doc_width = $(document).width();
				
				$("#glConatiner canvas").css('height', doc_height + 'px');
				
				$("#glConatiner canvas").css('width', doc_width + 'px');

				$("#glConatiner canvas").attr('width', doc_width);

				$("#glConatiner canvas").attr('height', doc_height);
			}
		}
		
		this.resize();
		
		$( window ).resize(function() {
			if(!PX.IsMobile){
		  		location.reload(true);
		  }
		});
		
		$("body").css('background-image', 'url(../webgl/data/textures/background.png)');

		//Animated Splash Logo
		$(".svg-wrapper").one('webkitAnimationEnd oanimationend msAnimationEnd animationend',   
		    function(e) {
		    
		    	$(".explore-container, .splash-text-bottom, .splash-logo-bottom").css('visibility', 'visible');
			}
		);

		$(".UNESCO#browse").bind('mousewheel DOMMouseScroll', function(event){
		    if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
		       
		       ns.slider(1);
		        
		    }
		    else {
		       
		       ns.slider(-1);
		       
		    }
		});

		$(document).on('click', ".UNESCO #arrow-back", function(e) {
			e.preventDefault();
			
			locationMarkers.OnMouseClickEvent( mouseVector3d, camera, false, null );

		});
		
		$(document).on('click', "#overlay", function(e) {
			e.preventDefault();
			
			if($(".UNESCO#browse").css('display') != 'none'){
				locationMarkers.OnMouseClickEvent( mouseVector3d, camera, false, null );
			}
		});		

		$(document).on('click', ".UNESCO .arrow.down.disabled", function(e) {
			e.preventDefault();


		});

		$(document).on('click', ".UNESCO .arrow.up.disabled", function(e) {
			e.preventDefault();

		});
		
		$(document).on('click', ".UNESCO .arrow.down:not(.disabled)", function(e) {
			e.preventDefault();

			ns.slider(-1);

		});

		$(document).on('click', ".UNESCO .arrow.up:not(.disabled)", function(e) {
			e.preventDefault();

			ns.slider(1);

		});		
		
		$(".UNESCO .explore-button").click(function(e) {
			e.preventDefault();

			ns.hideSplash();

			ns.centerLogo();

			// Change app state to Level 0
			OnExploreClick();

		});

		$(".UNESCO #zoom-in-button").click(function(e) {
			e.preventDefault();
			
			if(!$(this).hasClass('disabled')){
				ns.hideZoomIn();
				ZoomInFromLevel0ToLevel1(false);
			}
		});

		$(document).on('click', ".UNESCO #zoom-out-button", function(e) {
			e.preventDefault();
			
			if(!$(this).hasClass('disabled')){
				ns.hideZoomOut();
				
				ZoomOutFromLevel1ToLevel0(false);
			}
		});

		$(document).on('click', "#logo", function(e) {
			
			e.preventDefault();
			
			switch( appStateMan.GetCurrentState())
			        {
						case PX.AppStates.AppStateEntry:
			                
							break;
						case PX.AppStates.AppStateLevel0:	
				
							break;
			
			            case PX.AppStates.AppStateLevel1ToLevel0:
			            
			                break;
			
						case PX.AppStates.AppStateLevel0ToLevel1:
			                
			         
			                ZoomOutFromLevel1ToLevel0(false);
			                
			                break;
			
						case PX.AppStates.AppStateLevel1:
			                
			         
			                ZoomOutFromLevel1ToLevel0(false);
			                
							break;
								
						case PX.AppStates.AppStateLevel2:
			         
							break;
			
						case PX.AppStates.AppStateLevel2ToLevel1:
							
							break;
			
			            default:
			                break;
					}
			
			
			ns.hideZoomOut();
			ns.showZoomIn();
			
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
			
			new_top = old_top - ((item_height + item_margin) * index_diff);
			
			browse.find(".items-inner").css('top', new_top + 'px');
			
			ns.setArrows();
			
			ns.itemClicked();

		});

		$(document).on('click', ".UNESCO#slide-5 .magnify, .UNESCO#slide-5 .thumbnail", function(e) {
			e.preventDefault();

			if($(".UNESCO#slide-5").find('.magnify').css('display') == 'none'){
				
			} else {

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
           }
           
		});

		$(".UNESCO#share-button").click(function(e) {
			e.preventDefault();

			var menu = $(".UNESCO.share-menu");

			if (menu.css('opacity') == '0') {
				menu.fadeTo(1000, 1);
			} else {
				menu.fadeTo(1000, 0);
			}

		});

		$(".UNESCO#menu-button").click(function(e) {
			e.preventDefault();

			$(".UNESCO.furniture").hide();
			$(".UNESCO.furniture").hide();

			ns.overlayAppend();
			ns.center($(".UNESCO#about"));

			$(".UNESCO.close-button").show();
			$(".UNESCO#browse").css('visibility', 'hidden');
			$(".UNESCO#legend").css('visibility', 'hidden');
			$(".UNESCO#share-button").css('visibility', 'hidden');

		});

		$(document).on('click', ".UNESCO#about .contribute-button", function(e) {
			
			e.preventDefault();

			file_select = true;
			
			$("#portrait-warning").addClass("file-select");
			
			$("#participate .email").val("");
			$("#participate .blank").html("");
			$("#participate .status").attr('src', 'about:blank');
			$(".UNESCO#participate").attr('from', 'about');
			
			$("#about").hide();

			ns.center($(".UNESCO#participate"));

		});
		
		$(document).on('click', ".UNESCO#slide-5 .contribute-button", function(e) {
			e.preventDefault();

			ns.overlayAppend();
			
			file_select = true;
			
			$("#participate .email").val("");
			$("#participate .blank").html("");
			
			$(".UNESCO#participate").attr('from', 'slide-5');
			
			$("#slide-5").hide();
			
			ns.center($(".UNESCO#participate"));

		});		

		$(".close-button").click(function(e) {
			e.preventDefault();

			var make_visible = true;
			
			if($(".UNESCO#participate").css('display') == 'block'){
				
				make_visible = false;
				file_select = false;
				
				$("#portrait-warning").removeClass("file-select");
			
			
				if($(".UNESCO#participate").attr('from') == 'about'){
					
					$(".UNESCO#about").show();
					
				} else {
				
					$(".UNESCO#slide-5").show();	
					
				}
				
				$(".UNESCO#participate").hide();
				
			} else if($(".UNESCO#about").css('display') == 'block'){
				
				if($(".UNESCO#browse").css('display') == 'none'){
					ns.overlayRemove();
				}
				
				$(".UNESCO#about").hide();
				$(".UNESCO.furniture").show();
				$(this).hide();
				
			
				
			} else if($(".UNESCO#slide-5").css('display') == 'block'){
				
				//ns.overlayRemove();
				$(".UNESCO#slide-5").hide();
				
				ns.resetContainer();
				
				$(".UNESCO.furniture").show();
				$(".UNESCO#browse").show();
				$(this).hide();
				
			} else if($(".UNESCO#slide-9").css('display') == 'block'){
				
				ns.resetContainer();
				
				//$(".preloaderBG").hide();
				//$(".preloaderFG").hide();
				$(".preloader").hide();
				
				modelRenderer.Clear();
				Params.MainScene = true;
				$(".UNESCO#slide-9").hide();
				$(".UNESCO#slide-5").show();

			}
			
			if(make_visible){
				$(".UNESCO#browse").css('visibility', 'visible');
				$(".UNESCO#legend").css('visibility', 'visible');
				$(".UNESCO#share-button").css('visibility', 'visible');
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

			more.css('opacity', 0);
			
			var text = $(this).closest('ul').find('.text');
			
			var text_width = parseInt(text.css('width'), 10);
			
			var text_margin = parseInt(text.css('margin-right'), 10);
			
			var media = $(this).closest('ul').find('.media');
			
			var imgs = media.find('img');
			
			imgs.attr('width', text_width);
			
			var iframes = media.find('iframe');
			
			iframes.attr('width', text_width);
			
			var multiplier = 0;
			
			var show_media = false;
			
			if(imgs.length || iframes.length){
				multiplier += 1;	
				show_media = true;
			}
			
			var more_speed = 0;
			
			if(more.html().trim()){
				multiplier += 1;
				more.show();
				more_speed = 1000;
			
			}else {
				more.hide();	
			}
			
			var new_width = (text_width * multiplier) + (text_margin * multiplier);

			$(".prev").hide();
			$(".next").hide();
	
			var excerpt = container.find('.excerpt');
			
			var excerpt_offset = excerpt.offset().top;
			
			var more_offset = more.offset().top;
			
			var new_padding = excerpt_offset - more_offset;
						
			more.css('padding-top', new_padding + 'px');
			
			if(media.hasClass('add-margin-top')){
				
				var media_offset = media.offset().top;
				
				var new_margin = excerpt_offset - media_offset;
				
				media.css('margin-top', new_margin + 'px');			
			}
			
			$(this).closest('li').find('.collapse').show();
			
			var container_width = container.width();
			
			var new_container_width = container_width + new_width ;

			container.animate({
				
				width : new_container_width,
				
			}, 1000, function() {

				more.css('margin-right', text_margin + 'px');
				
				more.animate({
					
					width : text_width,
					
				}, more_speed, function() {
	
					more.animate({
						
						opacity : 1,
						
					}, 100, function() {
		
		
					});	
	
					if(show_media){
						
						media.css('margin-right', text_margin + 'px');
						
						media.animate({
							
							width : text_width,
							
						}, 1000, function() {
			
			
						});
					}
	
				});



			});
			

			

		});				

		$(document).on('click', ".collapse", function(e) {
			e.preventDefault();

			ns.resetContainer();
			
		});	

		$("#participate .upload-button").click(function(e) {
		
			e.preventDefault();
						
			$("#participate form").submit();
			
		});		
				
		$("#participate form").submit(function(e) {
		
			$("#participate .status").html("");
	
		});	
		
		$(document).on('change', "input.file", function(e) {
			
			var val = $(this).val();
			
			var filename= val.split('\\').pop().split('/').pop();
			
			$(".blank").html(filename);
		});	
		
					
		
	}

	this.itemClicked = function(){
		
		var ns = this;
		
		var elm = $('#browse .item.selected .container');
		
		ns.initItem(elm);
		
		var entry = elm.html();
			
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
		
		$(".UNESCO#legend").css('visibility', 'hidden');
		
		$(".UNESCO#slide-5").show();
	}
	
	this.next = function(direction){
		
		var ns = this;
		
		var idx = slide_index;
		
		nextitem = ns.nextItem(direction, idx);
		
		if (nextitem.length) {
				
			//var elm = $('#browse .item.selected .container');
			
			
			var elm = nextitem.find('.entry').wrapAll('<div>').parent();
			
			ns.initItem(elm);
			
			var entry = elm.html();
			
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
								
				if(!$(this).find(".entry").attr('filename')){
					$(this).find(".magnify").hide();
					
				} else {
					
					$(this).find(".magnify").show();
				}
				
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
			
			container.css('overflow', 'hidden');
			
			var imgs = media.find('img');
			
			var iframes = media.find('iframe');
			
			var multiplier = 0;
			
			var media_timing = 0;
			
			if(imgs.length || iframes.length){
				multiplier += 1;	
				media_timing = 1000;
			}			
			
			var more_timing = 0;

			if(more.html().trim()){
				multiplier += 1;	
				more_timing = 1000;
			}	
						
			var new_width = container_width - (more_width * multiplier) - (more_margin * multiplier);
						
			container.find('.collapse').hide();
						
			more.animate({
				
				opacity : 0,
				
			}, 100, function() {

				media.animate({
					
					width : 0,
					
				}, media_timing, function() {
	
					media.css('margin-right', '0');
					
					more.animate({
						
						width : 0,
						
					}, more_timing, function() {
						
						more.css('margin-right', '0');
						
						more.css('padding-top', '0');
						
						media.css('margin-top', '0');
						
						container.animate({
							
							width : new_width,
							
						}, 1000, function() {
							
							$(".prev").show();
							$(".next").show();
							
							container.find('.readmore').show();
							
							
						});
			
					});
				});

			});				
						
			
			
			
			
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
			
			ns.setArrows();
			
		} 
	}
	
	this.setArrows = function() {
		
		var idx = $("#browse .item.show.selected").index( "#browse .item.show");
		
		if(idx == 0){
		
			$(".arrow.up").addClass('disabled');
		
		}else{
			
			$(".arrow.up").removeClass('disabled');
		}
			
		if(idx + 1 == $("#browse .item.show").length){
		
			$(".arrow.down").addClass('disabled');
		
		}else{
			
			$(".arrow.down").removeClass('disabled');
		}
		
	}

	this.resize = function(selector, callback) {

		var ns = this;

		//var window_width = window.innerWidth;
		var window_width = $("body").width();

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

				} else if ($(this).is('svg')) {

					var attr = $(this).width();		
					var attr = attr * .01 * percentage;
					$(this).attr('width', attr);
					
					attr = $(this).height();		
					attr = attr * .01 * percentage;
					$(this).attr('height', attr);

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
			apply($(this), 'line-height');
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
		this.centerComplete(elm);
	}

	this.centerPrep = function(elm) {

		elm.css('position', 'absolute');

		elm.css('visibility', 'hidden');

		elm.parent().show();

		elm.show();

	}

	this.centerComplete = function(elm) {

		elm.css('visibility', 'visible');

	}
	
	this.centerVertical = function(elm) {
		
		this.centerPrep(elm);

		if(!elm.attr('centered-top')){
			
			elm.attr('reset-top', elm.css('top'));
			
			elm.attr('centered-top', 'centered-top');
		
		}
		
		//HEIGHT
		var height = elm.height();
		
		var window_height = window.innerHeight;
		
		var offset = height / 2;
		
		var middle = window_height / 2;
		
		var top = (middle - offset);

		elm.css('top', top + 'px');
		
		this.centerComplete(elm);

	}

	this.centerHorizontal = function(elm) {

		this.centerPrep(elm);
		
		if(!elm.attr('centered-left')){
			
			elm.attr('reset-left', elm.css('left'));
			
			elm.attr('centered-left', 'centered-left');
		
		}
		
		//WIDTH
		var width = elm.width();

		var window_width = window.innerWidth;

		var offset = width / 2;

		var middle = window_width / 2;

		var left = middle - offset;

		elm.css('left', left + 'px');

		elm.css('visibility', 'visible');
		
		this.centerComplete(elm);

	}
	
	this.reset = function(elm) {

		var reset_left = elm.attr('reset-left');
		
		if(reset_left){
			elm.css('left', reset_left);
			elm.attr('centered-left', '');
		}

		var reset_top = elm.attr('reset-top');
		
		if(reset_top){
			elm.css('top', reset_top);
			elm.attr('centered-top', '');
		}

	}	

	this.showExploreButton = function() {

		var imgs = [
			"../img/splash/explore-button.png",
			"../img/map/zoom-in.png",
			"../img/map/zoom-out.png",
			"../img/participate/coming-soon.png"
		];
		var arrayLength = imgs.length;
		for (var i = 0; i < arrayLength; i++) {
		    this.preloadImage(imgs[i]);
		}

	}
	
	this.preloadImage = function(src){
		
		var ns = this;
		
		var img = new Image();
		img.onload = function(){ns.afterPreloadImages(src);}
		img.src = src;	
		preloaded_images++;
		
		console.log("+--+  Load Image:\t\t" + preloaded_images + ":" + src);
	}
	
	this.afterPreloadImages = function(src){
		
		preloaded_images--;

		console.log("+--+  Loaded Image:\t\t" + preloaded_images + ":" + src);
		
		if(!preloaded_images){
			var exploreButton = $(".UNESCO .explore-button");
			exploreButton.css('display', 'block');
			exploreButton.css('opacity', 0.0);
			exploreButton.fadeTo(1000, 1);
		}
		
	}
	
	this.preloadCount = function(){
		
		return preloaded_images;
		
	}
	
	this.hideSplash = function() {

		$(".UNESCO#splash").hide();
		
		this.showZoomContainer();
		
		$(".UNESCO.furniture").show();
		$(".UNESCO#logo-bottom").show();
	}

	this.showBrowse = function(location_id) {

		var ns = this;
		
		ns.reset($("#legend"));
		
		ns.hideZoomContainer();
		
		ns.overlayAppend();
		
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
						
		//set location id				
		elm.attr('location-id', location_id);

		var status_selector = "";

		//get currently set status
		var status = elm.attr('status');

		//set status_selector
		if (status) {
			status_selector = '[status="' + status + '"]';
		}
		
		//reset shown items
		elm.find(".item").removeClass('show');

		//set location selector
		var selector = ".item[location-id=" + location_id + "]";

		//combine selectors
		var filtered_selector = selector + status_selector;

		//get matching items
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

		ns.legendUnclickable(elm, selector, 'Reconstructed');

		elm.find(".items .item").removeClass('selected');
		
		var item = elm.find(".items .item.show:eq(0)");

		item.addClass('selected');

		elm.show();
				
		var item_height = item.height();
		
		var item_margin = parseInt(item.css('margin-bottom'), 10);
		
		var new_top = item_height + item_margin;
		
		elm.find(".items-inner").css('top', new_top + 'px');

		$(".arrow.up").addClass('disabled');
		
		if(elm.find(".items-inner .item.show").length == 1){

			$(".arrow.down").addClass('disabled');		
		}
		
	}

	this.legendUnclickable = function(elm, selector, filter) {

		selector += '[status="' + filter + '"]';

		if (!elm.find(selector).length) {
			$("#legend a[status=" + filter + "]").removeClass('clickable').addClass('disabled');

		}

	}

	this.showZoomContainer = function() {

		var elm = $(".zoom-container");

		this.centerVertical(elm);

	}
	
	this.hideZoomContainer = function() {

		var elm = $(".zoom-container");

		elm.hide();

	}	
	
	this.hideZoomIn = function() {

		var elm = $("#zoom-in-button");

		elm.addClass("disabled");
	

	}

	this.hideZoomOut = function() {

		var elm = $("#zoom-out-button");

		elm.addClass("disabled");	


		
	}

	this.showZoomIn = function() {

		var elm = $("#zoom-in-button");

		elm.removeClass("disabled");	

	}

	this.showZoomOut = function() {

		var elm = $("#zoom-out-button");

		elm.removeClass("disabled");	

	}
	this.hideBrowse = function() {

		this.overlayRemove();
		
		this.centerHorizontal($("#legend"));

		$(".UNESCO#legend a").addClass('clickable');

		$(".UNESCO#browse").hide();

	}

	this.showLegend = function() {

		var elm = $(".UNESCO#legend");

		//elm.show();
		this.centerHorizontal(elm);

	}

	this.hideLegend = function() {

		$(".UNESCO#legend").hide();

	}

	this.afterLoadImages = function() {

		var ns = this;
		
		ns.center($("#splash"));
		
	}

	this.overlayAppend = function() {

		if(!$("#overlay").length){
			
			$("body").append('<div id="overlay"></div>');
		}
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

		//read through images.json
		var url = "webgl/data/images.json";

		$.ajax({
			dataType : "json",
			url : url,
			success : function(data) {

				rekrei_images = data;
				
				//read through reconstructions.json
				url = "webgl/data/reconstructions.json";
		
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
		//var body = $("<div>" + copy + "</div>");
		
		//var excerpt = body.find('p').first().html();
		
		//get rest (more)
		//body.find('p').first().remove();
		
		//var more = body.html();
		
		//val.excerpt = excerpt;
		
		//val.more = more;
		
		val.excerpt = copy;

		ns.buildItem(key, val, callback);

	}	

	this.buildItem = function(item_key, item, callback) {

		var ns = this;
		
		//if no details, look in images for a main image
		
		
		
		var content = $("#browse .items .clone").clone();

		content.removeClass('clone');

		content.attr('item-id', item.id);

		content.attr('location-id', item.location_id);

		content.find(".title .name").html(item.name);

		var status = 'Destroyed';

		if (item.details) {

			content.find('.entry').attr('folder', item.details);

			if (item.filename) {
				content.find('.entry').attr('filename', item.filename);
				status = 'Reconstructed';
				
				models[item.filename] = item;
				
			}

			var media = content.find('.media');
			media.addClass('add-margin-top');
					
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
			
		} 
	
		//look for more images
		if(item.is_default && item.is_default == 'true'){
			
			//look by location_id
			var lookup_id = item.location_id;
			var lookup_field = "location_id";
				
		} else {
			//look by reconstruction_id
			var lookup_id = item.id;
			var lookup_field = "reconstruction_id";			
		}
		
		var main_image_found = false;
		
		if(item.details){
			main_image_found = true;
		}
		
		main_image_found = ns.rekreiImages(item, content, lookup_id, lookup_field, main_image_found, false);

		if(main_image_found == false && lookup_field == "reconstruction_id"){
			
			ns.rekreiImages(item, content, item.location_id, "location_id", main_image_found, true);
			
		}
			
		var add_participate_button = false;
		
		if(!item.excerpt){
			item.excerpt = "";
		}
		
		var check_excerpt = item.excerpt.replace(/(<([^>]+)>)/ig,"").trim();
		
		if(!check_excerpt){
	
			item.excerpt = "<p>This information hasn't been written yet. Join us to get involved.</p>"
			add_participate_button = true;
		} 
		
		if(item.excerpt.length > 252){
			
			var short_text = jQuery.trim(item.excerpt).substring(0, 252).split(" ").slice(0, -1).join(" ") + "...";
			
			var short_len = short_text.length - 3;
			
			var rest = item.excerpt.substring(short_len, item.excerpt.length -1);
			 
			item.excerpt = short_text;
			
			item.more = rest;
			
		}
		
		if(add_participate_button){
			item.excerpt += '<br /><a href="#" class="contribute-button"></a>';	
		}
		
		if(item.more){
			content.find(".entry .more").html(item.more);
		}
		
		content.find(".entry .excerpt").html(item.excerpt);
		
		if(status == 'Destroyed'){
			var status_label = "DESTROYED MONUMENT";	
			var status_class = 'destroyed';
		}	else {
			var status_label = "DIGITALLY RECONSTRUCTED";
			var status_class = 'reconstructed';
		}
		
		content.find(".status").html(status_label);
		content.find(".status").addClass(status_class);
		content.attr('status', status);
		
		//console.log("name: " + item.name + " loc: " + item.location_id + " status: " + status);
				
		$("#browse .items .items-inner").append(content);

		//add to browse

		reconstructions_loaded++;

		reconstructions[item_key].status = status;

		if (reconstructions_loaded == reconstructions.length) {
			
			callback();
			
		}

	}
	
	this.rekreiImages = function(item, content, lookup_id, lookup_field, main_image_found, only_main){
		
		var count = 0;
		
		$.each(rekrei_images, function(key, val) {
		
			if(val[lookup_field] == lookup_id){
				
				count++;
				
				//build url
				//http://s3.amazonaws.com/rekrei-production/images/images/000/003/574/square/gohistoric_26477_z.jpg
				
				var image_url_start = "http://s3.amazonaws.com/rekrei-production/images/images/";
				
				var image_url_dir = "000/00";
				
				var image_id = val.id;
				
				switch(image_id.length) {
				    case 1:
				        image_url_dir += "0/00" + image_id;
				        break;
				    case 2:
				        image_url_dir += "0/0" + image_id;
				        break;
				    case 3:
				        image_url_dir += "0/" + image_id;
				        break;
				    case 4:
				        image_url_dir += image_id.slice(0, 1) + "/" + image_id.slice(1);
				        break;
				}
				
				image_url_dir += "/square/";
				
				var image_url = image_url_start + image_url_dir + val.filename;
				
				//add image
				if(count == 1 && !item.details){
				
					content.find(".image img").attr('src', image_url);
					content.find(".slide-image img").attr('src', image_url);		
					
					main_image_found = true;
					
				} else if(!only_main) {
					
					content.find(".entry .images").append('<img src="' + image_url + '" />');
				}
				
				
					
			}
		
		});
		
		return main_image_found;
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
	
	this.initItem = function(elm){
				
				
		if(!elm.find('.more').html().trim().length && !elm.find('.images').html().trim().length && !elm.find('.videos').html().trim().length){
			
			elm.find('.readmore').css('visibility', 'hidden');
				
		} else {
			elm.find('.readmore').css('visibility', 'visible');
		}
		
		if(!elm.find(".entry").attr('filename')){
			
			$(".magnify").hide();
			$(".thumbnail").addClass('no-pointer');
				
		} else {
			
			$(".magnify").show();
			$(".thumbnail").removeClass('no-pointer');
			
		}			
		
	}
	
	this.showModelLoader = function(){
		
		//$('.splash-text-top').html('<div class="svg-wrapper resize"><svg viewBox="0 0 696.86 358.59" width="700px" height="361px" class="resize">
		
		var preloader = $(".preloader");
		
		preloader.html($('.splash-text-top').html());
		
		var wrapper = $(".svg-wrapper");
		
		wrapper.css('width', 'auto');
		
		var svg = wrapper.find('svg');
		 
		svg.attr('width', '203px');
		svg.attr('height', '104.69px');
		
		var cls = svg.find('.cls-3');
		
		cls.css('animation-iteration-count', 'infinite');
		this.center($(".preloader"));
		
		
		wrapper.one('webkitAnimationEnd oanimationend msAnimationEnd animationend',   
		    function(e) {
		    
		    }
		);		
		
		
	}
	
	
}).apply(UNESCO);

var img = new Image();
img.onload = function() {

	$(document).ready(function() {

		UNESCO.init();

	});

};
img.src = "../webgl/data/textures/background.png";

