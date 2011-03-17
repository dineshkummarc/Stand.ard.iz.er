(function(window, document, undef) {
	
	// Stand.ard.iz.er library
	var standardizer = (function(){
	
		// Private implementation
		var __standardizer = {
			
			/**
			 * Following property indicates whether the current rendering engine is Trident (i.e. Internet Explorer)
			 * 
			 * @return v { Integer|undefined } if IE then returns the version, otherwise returns 'undefined' to indicate NOT a IE browser
			 */
			isIE: (function() {
				/*var undef,
					 v = 3,
					 div = document.createElement('div'),
					 all = div.getElementsByTagName('i');
			
				while (
					div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
					all[0]
				);
			
				return v > 4 ? v : undef;*/
			}()),
			
			// Errors
			errors: [],
			
			/**
			 * Listens for when the DOM is ready to be interacted with.
			 * Then processes queued functions.
			 * 
			 * @param fn { Function } a function to be executed when the DOM is ready.
			 * @return anonymous { Function } immediately-invoked function expression which returns a Function to be executed.
			 */
			domready: (function(){

				// Variables used throughout this script
				var queue = [],
					 exec,
					 loaded,
					 original_onload;
				
				// Private inner function which is called once DOM is loaded.
				function process() {
					// Let the script know the DOM is loaded
					loaded = true;
					
					// Cleanup
					if (document.addEventListener) {
						document.removeEventListener("DOMContentLoaded", process, false);
					}
				
					// Move the zero index item from the queue and set 'exec' equal to it
					while ((exec = queue.shift())) {
						// Now execute the current function
						exec();
					}
				}
			
				return function(fn) {
					// if DOM is already loaded then just execute the specified function
					if (loaded) { 
						return fn();
					}
					
					if (document.addEventListener) {
						// Any number of listeners can be set for when this event fires,
						// but just know that this event only ever fires once
						document.addEventListener("DOMContentLoaded", process, false);
					} else {
						// All browsers support document.readyState (except Firefox 3.5 and lower, but they support DOMContentLoaded event)
						/loaded|complete/.test(document.readyState) ? process() : setTimeout("__standardizer.domready(" + fn + ")", 10);
					}
					
					// Fall back to standard window.onload event
					// But make sure to store the original window.onload in case it was already set by another script
					original_onload = window.onload;
					
					window.onload = function() {
					
						// Note: calling process() now wont cause any problem for modern browsers.
						// Because the function would have already been called when the DOM was loaded.
						// Meaning the queue of functions have already been executed
						process();
						
						// Check for original window.onload and execute it
						if (original_onload) {
							original_onload();
						}
						
					};
					
					// As the DOM hasn't loaded yet we'll store this function and execute it later
					queue.push(fn);
				};
				
			}()),
			
			/**
			 * XMLHttpRequest abstraction.
			 * 
			 * @return xhr { XMLHttpRequest|ActiveXObject } a new instance of either the native XMLHttpRequest object or the corresponding ActiveXObject
			 */
		 	xhr: (function() {
	
				// Create local variable which will cache the results of this function
				var xhr;
				
				return function() {
					// Check if function has already cached the value
					if (xhr) {
						// Create a new XMLHttpRequest instance
						return new xhr();
					} else {
						// Check what XMLHttpRequest object is available and cache it
						xhr = (!window.XMLHttpRequest) ? function() {
							return new ActiveXObject(
								// Internet Explorer 5 uses a different XMLHTTP object from Internet Explorer 6
								(__standardizer.isIE < 6) ? "Microsoft.XMLHTTP" : "MSXML2.XMLHTTP"
							);
						} : window.XMLHttpRequest;
						
						// Return a new XMLHttpRequest instance
						return new xhr();
					}
				};
				
			}()),
			
			/**
			 * A basic AJAX method.
			 * 
			 * @param settings { Object } user configuration
			 * @return undefined {  } no explicitly returned value
			 */
		 	ajax: function(settings) {
		 	
		 		// JavaScript engine will 'hoist' variables so we'll be specific and declare them here
		 		var xhr, url, requestDone;
		 		
		 		// Load the config object with defaults, if no values were provided by the user
				config = {
					// The type of HTTP Request
					method: settings.method || 'POST',
					
					// The data to POST to the server
					data: settings.data || '',
				
					// The URL the request will be made to
					url: settings.url || '',
				
					// How long to wait before considering the request to be a timeout
					timeout: settings.timeout || 5000,
				
					// Functions to call when the request fails, succeeds, or completes (either fail or succeed)
					onComplete: settings.onComplete || function(){},
					onError: settings.onError || function(){},
					onSuccess: settings.onSuccess || function(){},
				
					// The data type that'll be returned from the server
					// the default is simply to determine what data was returned from the and act accordingly.
					dataType: settings.dataType || ''
				};
				
				// Create new cross-browser XMLHttpRequest instance
				xhr = __standardizer.xhr();
				
				// Open the asynchronous request
				xhr.open(config.method, config.url, true);
				
				// Determine the success of the HTTP response
				function httpSuccess(r) {
					try {
						// If no server status is provided, and we're actually
						// requesting a local file, then it was successful
						return !r.status && location.protocol == 'file:' ||
						
						// Any status in the 200 range is good
						( r.status >= 200 && r.status < 300 ) ||
						
						// Successful if the document has not been modified
						r.status == 304 ||
						
						// Safari returns an empty status if the file has not been modified
						navigator.userAgent.indexOf('Safari') >= 0 && typeof r.status == 'undefined';
					} catch(e){
						// Throw a corresponding error
						throw new Error("httpSuccess = " + e);
					}
					
					// If checking the status failed, then assume that the request failed too
					return false;
				}
				
				// Extract the correct data from the HTTP response
				function httpData(r, type) {
				
					// Get the content-type header
					var ct = r.getResponseHeader("content-type");
					
					// If no default type was provided, determine if some
					// form of XML was returned from the server
					var data = !type && ct && ct.indexOf("xml") >= 0;
					
					// Get the XML Document object if XML was returned from the server,
					// otherwise return the text contents returned by the server
					data = (type == "xml" || data) ? r.responseXML : r.responseText;
					
					// If the specified type is "script", execute the returned text response as if it was JavaScript
					if (type == "script") {
						eval.call(window, data);
					}
					
					// Return the response data (either an XML Document or a text string)
					return data;
					
				}
				
				// Initalize a callback which will fire within the timeout range, cancelling the request (if it has not already occurred)
				window.setTimeout(function() {
					requestDone = true;
				}, config.timeout);
				
				// Watch for when the state of the document gets updated
				xhr.onreadystatechange = function() {
					// Wait until the data is fully loaded, and make sure that the request hasn't already timed out
					if (xhr.readyState == 4 && !requestDone) {
						
						// Check to see if the request was successful
						if (httpSuccess(xhr)) {
							// Execute the success callback
							config.onSuccess(httpData(xhr, config.type));
						}
						// Otherwise, an error occurred, so execute the error callback
						else {
							config.onError(httpData(xhr, config.type));
						}
			
						// Call the completion callback
						config.onComplete();
						
						// Clean up after ourselves, to avoid memory leaks
						xhr = null;
						
					} else if (requestDone && xhr.readyState != 4) {
						// If the script timed out then keep a log of it so the developer can query this and handle any exceptions
						__standardizer.errors.push(url + " { timed out } ");
						
						// Bail out of the request immediately
						xhr.onreadystatechange = null;
					}
				};
				
				// Get if we should POST or GET...
				if (config.data) {
					// Settings
					xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
					
					// Establish the connection to the server
					xhr.send(config.data);
				} else {					
					// Establish the connection to the server
					xhr.send(null);
				}
	
			},
			
			// Event management
			events: {
				// The add method allows us to assign a function to execute when an 
				// event of a specified type occurs on a specific element
				add: function (element, eventType, callback) {
				
					// Store the current value of this to use within closures 
					var self = this; 
					
					eventType = eventType.toLowerCase();
					
					// W3C method
					if (element.addEventListener) { 
						element.addEventListener(eventType, function(e) {
							// Execute callback function, passing it a standardized version of 
							// the event object, e. The standardize method is defined later 
							callback(self.standardize(e)); 
						}, false);
					} 
					
					// Internet Explorer method 
			      else if (element.attachEvent) {
						element.attachEvent("on" + eventType, function() {
							// IE uses window.event to store the current event's properties 
							callback(self.standardize(window.event)); 
						});
					}
					
				},
				
				// The remove method allows us to remove previously assigned code from an event 
				remove: function (element, eventType, callback) {
				
			      eventType = eventType.toLowerCase(); 
					  
					// W3C method
					if (element.removeEventListener) { 
						element.removeEventListener(element, eventType, callback); 
			      } 
			      
			      // Internet Explorer method 
			      else if (element.detachEvent) { 
			      	element.detachEvent("on" + eventType, callback); 
			      }
					
				},
				
				// The standardize method produces a unified set of event 
				// properties, regardless of the browser 
				standardize: function(event) { 
				
					// These two methods, defined later, return the current position of the 
					// mouse pointer, relative to the document as a whole, and relative to the 
					// element the event occurred within 
					var page = this.getMousePositionRelativeToDocument(event); 
					var offset = this.getMousePositionOffset(event);
					
					// Let's stop events from firing on element nodes above the current...
					
					// W3C method 
					if (event.stopPropagation) { 
						event.stopPropagation(); 
					} 
					
					// Internet Explorer method 
					else { 
						event.cancelBubble = true; 
					} 
					
					// We return an object literal containing seven properties and one method 
					return { 
					
						// The target is the element the event occurred on 
						target: this.getTarget(event), 
						
						// The relatedTarget is the element the event was listening for, 
						// which can be different from the target if the event occurred on an 
						// element located within the relatedTarget element in the DOM 
						relatedTarget: this.getRelatedTarget(event), 
						
						// If the event was a  keyboard- related one, key returns the character 
						key: this.getCharacterFromKey(event), 
						
						// Return the x and y coordinates of the mouse pointer, 
						// relative to the document 
						pageX: page.x, 
						pageY: page.y, 
						
						// Return the x and y coordinates of the mouse pointer, 
						// relative to the element the current event occurred on 
						offsetX: offset.x, 
						offsetY: offset.y, 
						
						// The preventDefault method stops the default event of the element 
						// we're acting upon from occurring. If we were listening for click 
						// events on a hyperlink, for example, this method would stop the 
						// link from being followed 
						preventDefault: function() {
						 
						 	// W3C method
							if (event.preventDefault) {
								event.preventDefault();
							} 
							
							// Internet Explorer method
							else { 
								event.returnValue = false; 
							} 
							
						}
						
					};
					
				},
				
				// The getTarget method locates the element the event occurred on
				getTarget: function(event) { 
				
					// Internet Explorer value is srcElement, W3C value is target 
					var target = event.srcElement || event.target; 
					
					// Fix legacy Safari bug which reports events occurring on a text node instead of an element node 
					if (target.nodeType == 3) { // 3 denotes a text node 
						target = target.parentNode; // Get parent node of text node 
					} 
					
					// Return the element node the event occurred on 
					return target;
					 
				},
				
				// The getCharacterFromKey method returns the character pressed when 
				// keyboard events occur. You should use the keypress event 
				// as others vary in reliability 
				getCharacterFromKey: function(event) {
				 
					var character = ""; 
					
					// Internet Explorer 
					if (event.keyCode) {
						character = String.fromCharCode(event.keyCode); 
					} 
					
					// W3C 
					else if (event.which) {
						character = String.fromCharCode(event.which); 
					} 
					
					return character;
					
				},
				
				// The getMousePositionRelativeToDocument method returns the current 
				// mouse pointer position relative to the top left edge of the current page	
				getMousePositionRelativeToDocument: function(event) { 
					
					var x = 0, y = 0; 
					
					// pageX gets coordinates of pointer from left of entire document 
					if (event.pageX) { 
						x = event.pageX; 
						y = event.pageY; 
					} 
					
					// clientX gets coordinates from left of current viewable area 
					// so we have to add the distance the page has scrolled onto this value 
					else if (event.clientX) { 
						x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
						y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
					}
					
					// Return an object literal containing the x and y mouse coordinates 
					return { 
						x: x, 
						y: y 
					};
					
				},
				
				// The getMousePositionOffset method returns the distance of the mouse 
				// pointer from the top left of the element the event occurred on 
				getMousePositionOffset: function(event) {
				 
					var x = 0, y = 0; 
				
					if (event.layerX) { 
						x = event.layerX; 
						y = event.layerY; 
					}
					
					// Internet Explorer proprietary
					else if (event.offsetX) { 
						x = event.offsetX; 
						y = event.offsetY; 
					} 
					
					// Returns an object literal containing the x and y coordinates of the 
					// mouse relative to the element the event fired on 
					return { 
						x: x, 
						y: y 
					};
					
				},
				
				// The getRelatedTarget method returns the element node the event was set up to 
				// fire on, which can be different from the element the event actually fired on 
				getRelatedTarget: function(event) { 
				
					var relatedTarget = event.relatedTarget; 
					
					// With mouseover events, relatedTarget is not set by default 
					if (event.type == "mouseover") { 
						relatedTarget = event.fromElement; 
					} 
					
					// With mouseout events, relatedTarget is not set by default
					else if (event.type == "mouseout") { 
						relatedTarget = event.toElement; 
					}
					
					return relatedTarget; 
					
				}
			},
			
			utilities: {
				// The toCamelCase method takes a hyphenated value and converts it into 
				// a camel case equivalent, e.g.,  margin- left becomes marginLeft. Hyphens 
				// are removed, and each word after the first begins with a capital letter 
				toCamelCase: function(hyphenatedValue) { 
					var result = hyphenatedValue.replace(/-\D/g, function(character) { 
						return character.charAt(1).toUpperCase(); 
					}); 
					
					return result; 
				}, 
				
				// The toHyphens method performs the opposite conversion, taking a camel 
				// case string and converting it into a hyphenated one. 
				// e.g., marginLeft becomes  margin- left 
				toHyphens: function(camelCaseValue) { 
					var result = camelCaseValue.replace(/[A-Z]/g, function(character) { 
						return  ('-' + character.charAt(0).toLowerCase()); 
					});
				
					return result; 
				}
			},
			
			css: {
				// The getAppliedStyle method returns the current value of a specific 
				// CSS style property on a particular element
				getAppliedStyle: function(element, styleName) { 
					var style = "";
					
					if (window.getComputedStyle) { 
						//  W3C- specific method. Expects a style property with hyphens 
						style = element.ownerDocument.defaultView.getComputedStyle(element, null).getPropertyValue(__standardizer.utilities.toHyphens(styleName)); 
					} else if (element.currentStyle) { 
						// Internet Explorer-specific method. Expects style property names 
						// in camel case 
						style = element.currentStyle[__standardizer.utilities.toCamelCase(styleName)]; 
					}
					  
					// Return the value of the style property found 
					return style; 
				},
				
				// The getArrayOfClassNames method is a utility method which returns an 
				// array of all the CSS class names assigned to a particular element. 
				// Multiple class names are separated by a space character
				getArrayOfClassNames: function(element) { 
					var classNames = []; 
					if (element.className) { 
						// If the element has a CSS class specified, create an array 
						classNames = element.className.split(' '); 
					} 
					return classNames; 
				},
				
				// The addClass method adds a new CSS class of a given name to a particular element
				addClass: function(element, className) { 
					// Get a list of the current CSS class names applied to the element 
					var classNames = this.getArrayOfClassNames(element); 
					
					// Add the new class name to the list 
					classNames.push(className);
					
					// Convert the list in space-separated string and assign to the element 
					element.className = classNames.join(' '); 
				},
				
				// The removeClass method removes a given CSS class name from a given element
				removeClass: function(element, className) { 
					var classNames = this.getArrayOfClassNames(element); 
			        
					// Create a new array for storing all the final CSS class names in 
					var resultingClassNames = []; 
			        
					for (var index = 0; index < classNames.length; index++) { 
						// Loop through every class name in the list 
						if (className != classNames[index]) { 
							// Add the class name to the new list if it isn't the one specified 
							resultingClassNames.push(classNames[index]); 
						} 
					}
					  
					// Convert the new list into a  space- separated string and assign it 
					element.className = resultingClassNames.join(" "); 
				},
				
				// The hasClass method returns true if a given class name exists on a 
				// specific element, false otherwise
				hasClass: function(element, className) { 
					// Assume by default that the class name is not applied to the element 
					var isClassNamePresent = false; 
					var classNames = this.getArrayOfClassNames(element); 
			        
					for (var index = 0; index < classNames.length; index++) { 
						// Loop through each CSS class name applied to this element 
						if (className == classNames[index]) { 
							// If the specific class name is found, set the return value to true 
							isClassNamePresent = true; 
						} 
					} 
			        
					// Return true or false, depending on if the specified class name was found 
					return isClassNamePresent; 
				}
			}
			
		};
	
		// Return public API
		return {
			load: __standardizer.domready,
			ajax: __standardizer.ajax,
			events: __standardizer.events,
			css: __standardizer.css,
			find: Sizzle
		};
		
	}());
	
	// Expose st to the global object
	window.st = standardizer;
	
}(this, this.document));