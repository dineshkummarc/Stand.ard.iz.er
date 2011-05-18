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
				var undef,
					 v = 3,
					 div = document.createElement('div'),
					 all = div.getElementsByTagName('i');
			
				while (
					div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
					all[0]
				);
			
				return v > 4 ? v : undef;
			}()),
			
			/**
			 * The following method is a direct copy from Douglas Crockfords json2.js script (https://github.com/douglascrockford/JSON-js/blob/master/json2.js)
			 * It is used to replicate the native JSON.parse method found in most browsers.
			 * e.g. IE<8 hasn't got a native implementation.
			 * 
			 * @return { Object } a JavaScript Object Notation (JSON) compatible object
			 */
			json: function(text) {
				// The parse method takes a text and returns a JavaScript value if the text is a valid JSON text.
				var j,
					 cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
				
				function walk(holder, key) {
					// The walk method is used to recursively walk the resulting structure so that modifications can be made.
					var k, v, value = holder[key];
					if (value && typeof value === 'object') {
						for (k in value) {
							if (Object.prototype.hasOwnProperty.call(value, k)) {
								v = walk(value, k);
								if (v !== undefined) {
									value[k] = v;
								} else {
									delete value[k];
								}
							}
						}
					}
					return reviver.call(holder, key, value);
				}
				
				// Parsing happens in four stages. In the first stage, we replace certain
				// Unicode characters with escape sequences. JavaScript handles many characters
				// incorrectly, either silently deleting them, or treating them as line endings.
				text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
            	text = text.replace(cx, function(a) {
               	return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
					});
            }
            
            // In the second stage, we run the text against regular expressions that look
				// for non-JSON patterns. We are especially concerned with '()' and 'new'
				// because they can cause invocation, and '=' because it can cause mutation.
				// But just to be safe, we want to reject all unexpected forms.
				
				// We split the second stage into 4 regexp operations in order to work around
				// crippling inefficiencies in IE's and Safari's regexp engines. First we
				// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
				// replace all simple value tokens with ']' characters. Third, we delete all
				// open brackets that follow a colon or comma or that begin the text. Finally,
				// we look to see that the remaining characters are only whitespace or ']' or
				// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.				
				if (/^[\],:{}\s]*$/
					.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
				   .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
				   .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
				
				// In the third stage we use the eval function to compile the text into a
				// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
				// in JavaScript: it can begin a block or an object literal. We wrap the text
				// in parens to eliminate the ambiguity.				
					j = eval('(' + text + ')');
				
				// In the optional fourth stage, we recursively walk the new structure, passing
				// each name/value pair to a reviver function for possible transformation.				
				   return typeof reviver === 'function' ? walk({'': j}, '') : j;
				}
				
				// If the text is not JSON parseable, then a SyntaxError is thrown.				
				throw new SyntaxError('JSON.parse');
			},
			
			// Errors for AJAX request
			errors: [],
			
			/**
			 * Listens for when the DOM is ready to be interacted with.
			 * Then processes queued functions.
			 * 
			 * @param fn { Function } a function to be executed when the DOM is ready.
			 * @return anonymous { Function } this method is an immediately-invoked function expression which returns an anonymous Function to be executed.
			 */
			domready: (function(){

				// Variables used throughout this function
				var win = window,
					 doc = win.document,
					 dce = doc.createElement,
					 supportAEL = (function(){
					 	if (doc.addEventListener) {
					 		return true;
					 	} else {
					 		return false;
					 	}
					 }()), 
					 queue = [],
					 exec,
					 loaded,
					 fallback_onload, 
					 explorerTimer,
					 readyStateTimer,
					 // Had to duplicate isIE function from above as both sections of the script rely on isIE being an IIFE 
					 // (immediately invoked function expression)
					 isIE = (function() {
						var undef,
							 v = 3,
							 div = doc.createElement('div'),
							 all = div.getElementsByTagName('i');
					
						while (
							div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
							all[0]
						);
					
						return v > 4 ? v : undef;
					}());
				
				// Private inner function which is called once DOM is loaded.
				function process() {
					// Let the script know the DOM is loaded
					loaded = true;
					
					// Cleanup
					if (supportAEL) {
						doc.removeEventListener("DOMContentLoaded", process, false);
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
					
					if (supportAEL) {
						// Any number of listeners can be set for when this event fires,
						// but just know that this event only ever fires once
						doc.addEventListener("DOMContentLoaded", process, false);
					}
					
					// Internet Explorer versions less than 9 don't support DOMContentLoaded.
					// The doScroll('left') method  by Diego Perini (http://javascript.nwbox.com/IEContentLoaded/) appears to be the most reliable solution.
					// Microsoft documentation explains the reasoning behind this http://msdn.microsoft.com/en-us/library/ms531426.aspx#Component_Initialization
					else if (isIE < 9) {
						explorerTimer = win.setInterval(function() {
							if (doc.body) {
								// Check for doScroll success
								try {
									dce('div').doScroll('left');
									win.clearInterval(explorerTimer);
								} catch(e) { 
									return;
								}
								
								// Process function stack
								process();
								return;
							}
						}, 10);
						
						// Inner function to check readyState
						var checkReadyState = function() {
							if (doc.readyState == 'complete') {
								// Clean-up
								doc.detachEvent('onreadystatechange', checkReadyState);
								win.clearInterval(explorerTimer);
								win.clearInterval(readyStateTimer);
								
								// Process function stack
								process();
							}
						};
			
						// If our page is placed inside an <iframe> by another user then the above doScroll method wont work.
						// As a secondary fallback for Internet Explorer we'll check the readyState property.
						// Be aware that this will fire *just* before the window.onload event so isn't ideal.
						// Also notice that we use IE specific event model (attachEvent) to avoid being overwritten by 3rd party code.
						doc.attachEvent('onreadystatechange', checkReadyState);
						
						// According to @jdalton: some browsers don't fire an onreadystatechange event, but do update the document.readyState
						// So to workaround the above snippet we'll also poll via setInterval.
						readyStateTimer = win.setInterval(function() {
							checkReadyState();
						}, 10);
					}
					
					fallback_onload = function() {
						// Note: calling process() now wont cause any problem for modern browsers.
						// Because the function would have already been called when the DOM was loaded.
						// Meaning the queue of functions have already been executed
						process();
						
						// Clean-up
						if (supportAEL) {
							doc.removeEventListener('load', fallback_onload, false);
						} else {
							doc.detachEvent('onload', fallback_onload);
						}
					};
					
					// Using DOM1 model event handlers makes the script more secure than DOM0 event handlers.
					// This way we don't have to worry about an already existing window.onload being overwritten as DOM1 model allows multiple handlers per event.
					if (supportAEL) {
						doc.addEventListener('load', fallback_onload, false);
					} else {
						doc.attachEvent('onload', fallback_onload);
					}
					
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
		 		var xhr, url, requestDone, 
		 		
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
					// the default is simply to determine what data was returned from the server and act accordingly.
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
				function httpData(xhr, type) {
					
					if (type === 'json') {
						// Make sure JSON parser is natively supported
						if (window.JSON !== undefined) {
							return JSON.parse(xhr.responseText);
						} 
						// IE<8 hasn't a native JSON parser so we'll need to eval() the code - dangerous I know
						else {
							return __standardizer.json(xhr.responseText);
							//return eval('(' + xhr.responseText + ')');
						}
					} 
					
					/*
					// If the specified type is "script", execute the returned text response as if it was JavaScript
					else if (type === 'script') {
						eval.call(window, xhr.responseText);
					}
					*/
					
					//
					else if (type === 'html') {
						return xhr.responseText;
					}
					
					//
					else if (type === 'xml') {
						return xhr.responseXML;
					}
					
					// Attempt to work out the content type
					else {
						// Get the content-type header
						var contentType = xhr.getResponseHeader("content-type"), 
							 data = !type && contentType && contentType.indexOf("xml") >= 0; // If no default type was provided, determine if some form of XML was returned from the server
						
						// Get the XML Document object if XML was returned from the server,
						// otherwise return the text contents returned by the server
						data = (type == "xml" || data) ? xhr.responseXML : xhr.responseText;	
						
						// Return the response data (either an XML Document or a text string)
						return data;
					}
					
				}
				
				// Initalize a callback which will fire within the timeout range, also cancelling the request (if it has not already occurred)
				window.setTimeout(function() {
					requestDone = true;
					config.onComplete();
				}, config.timeout);
				
				// Watch for when the state of the document gets updated
				xhr.onreadystatechange = function() {
				
					// Wait until the data is fully loaded, and make sure that the request hasn't already timed out
					if (xhr.readyState == 4 && !requestDone) {
						
						// Check to see if the request was successful
						if (httpSuccess(xhr)) {
							// Execute the success callback
							config.onSuccess(httpData(xhr, config.dataType));
						}
						// Otherwise, an error occurred, so execute the error callback
						else {
							config.onError(httpData(xhr, config.dataType));
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
			
			/**
			 * hashchange event, HTML5 pushState support?
			 */
		 	history: function() {
		 		
		 	},
			
			/**
			 * Event management
			 * 
			 * Based on: addEvent/removeEvent written by Dean Edwards, 2005
			 * http://dean.edwards.name/weblog/2005/10/add-event/
			 * http://dean.edwards.name/weblog/2005/10/add-event2/
			 * 
			 * It doesn't utilises the DOM Level 2 Event Specification (http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/ecma-script-binding.html)
			 * Instead it uses the traditional DOM Level 1 methods along with a hash map object to correlate the different listeners/handlers.
			 * 
			 * Originally I had used a branching technique for add/removeEventListener (W3C) & add/detachEvent (IE).
			 * But discovered that trying to standardise the event object for a listener was impossible because it meant wrapping the callback in a function.
			 * And within that function then executing the callback and passing through a normalised event object.
			 * Problem is the removeEventListener can't remove listeners for anonymous functions.
			 * 
			 * e.g. this doesn't work...
			   
			   element.addEventListener(eventType, function(e) {
            	handler(__standardizer.events.standardize(e));
            }, false); 
            
			 */
			events: {
			
				/**
				 * A counter to generate a unique event handler ID
				 */
				id: 1,
			
				/**
				 * The add method allows us to assign a function to execute when an event of a specified type occurs on a specific element
				 * 
				 * @param element { Element/Node } the element that will have the event listener attached
				 * @param eventType { String } the event type, e.g. 'click' that will trigger the event handler
				 * @param handler { Function } the function that will execute as the event handler
				 * @return undefined {  } no explicitly returned value
				 */
				add: function(element, eventType, handler) {
					
					// Normalise user input
					eventType = eventType.toLowerCase();

					// Assign each event handler function a unique ID (via a static property '$$guid')
					if (!handler.$$guid) { 
						handler.$$guid = __standardizer.events.id++;
					}
					
					// Create hash table of event types for the element.
					// As there could be different events for the same element.
					if (!element.events) { 
						element.events = {};
					}
					
					// Create hash table of event handlers for each element/event pair
					var handlers = element.events[eventType];
					if (!handlers) {
						// If no eventType found then create empty hash for it
						handlers = element.events[eventType] = {};

						// Store the current event handler.
						// As each eventType could have multiple handlers needed to be executed for it.
						if (element["on" + eventType]) {
							handlers[0] = element["on" + eventType];
						}
					}
					
					// Store the event handler in the hash table
					handlers[handler.$$guid] = handler;
					
					// Assign a global event handler to do all the work
					element["on" + eventType] = __standardizer.events.handler;
					
				},
				
				/**
				 * The remove method allows us to remove previously assigned code from an event
				 * 
				 * @param element { Element/Node } the element that will have the event listener detached
				 * @param eventType { String } the event type, e.g. 'click' that triggered the event handler
				 * @param handler { Function } the function that was to be executed as the event handler
				 * @return undefined {  } no explicitly returned value
				 */
				remove: function(element, eventType, handler) {
				
					// Normalise user input
					eventType = eventType.toLowerCase();
					
					// Delete the event handler from the hash table
					if (element.events && element.events[eventType]) {
						delete element.events[eventType][handler.$$guid];
					}
					
				},
			
				/**
				 * 
				 */
				handler: function(e) {
				
					var returnValue = true,
						 handlers,
						 fn;
	
					// Standardise the event object
					e = e || window.event;
					
					// If you try and pass e to standardize method without first checking for e || window.event then a race condition issue happens with IE<8
					e = __standardizer.events.standardize(e);
					
					// Get a reference to the hash table of event handlers
					handlers = this.events[e.type];

					// Execute each event handler
					for (var i in handlers) {
						// Store current handler to be executed
						fn = handlers[i];
						
						// If after executing the function it's return value is false, then explicitly set the return value
						if (fn(e) === false) {
							returnValue = false;
						}
					}
					
					return returnValue;
					
				},
				
				/**
				 * 
				 */
			 	delegate: function() {
			 		
			 	},
								
				/**
				 * The standardize method produces a unified set of event properties, regardless of the browser
				 * 
				 * @param event { Object } the event object associated with the event that was triggered
				 * @return anonymous { Object } an un-named object literal with the relevant event properties normalised
				 */
			 	standardize: function(event) { 
				
					// These two methods, defined later, return the current position of the 
					// mouse pointer, relative to the document as a whole, and relative to the 
					// element the event occurred within 
					var page = this.getMousePositionRelativeToDocument(event),
						 offset = this.getMousePositionOffset(event),
						 type = event.type;
					
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
					
						// The event type
						type: type,
						
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
				
				/**
				 * The getTarget method locates the element the event occurred on
				 * 
				 * @param event { Object } the event object associated with the event that was triggered
				 * @return target { Element/Node } the element that was the target of the triggered event
				 */
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
				
				/**
				 * The getCharacterFromKey method returns the character pressed when keyboard events occur. 
				 * You should use the keypress event as others vary in reliability
				 * 
				 * @param event { Object } the event object associated with the event that was triggered
				 * @return character { String } the character pressed when keyboard events occurred
				 */
			 	getCharacterFromKey: function(event) {
				 
					var character = "",
						 keycode; 
					
					// Internet Explorer 
					if (event.keyCode) {
						keycode = event.keyCode;
						character = String.fromCharCode(event.keyCode); 
					} 
					
					// W3C 
					else if (event.which) {
						keycode = event.which;
						character = String.fromCharCode(event.which); 
					} 
					
					return { code:keycode, character:character };
					
				},
				
				/**
				 * The getMousePositionRelativeToDocument method returns the current mouse pointer position relative to the top left edge of the current page.
				 * 
				 * @param event { Object } the event object associated with the event that was triggered
				 * @return anonymous { Object } the x and y coordinates
				 */
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
				
				/**
				 * The getMousePositionOffset method returns the distance of the mouse pointer from the top left of the element the event occurred on
				 * 
				 * @param event { Object } the event object associated with the event that was triggered
				 * @return anonymous { Object } the x and y coordinates of the mouse relative to the element
				 */
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
					
					// Returns an object literal containing the x and y coordinates of the mouse relative to the element the event fired on 
					return { 
						x: x, 
						y: y 
					};
					
				},
				
				/**
				 * The getRelatedTarget method returns the element node the event was set up to fire on, 
				 * which can be different from the element the event actually fired on
				 * 
				 * @param event { Object } the event object associated with the event that was triggered
				 * @return relatedTarget { Element/Node } the element the event was set up to fire on
				 */
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
			
				/**
				 * The toCamelCase method takes a hyphenated value and converts it into a camel case equivalent.
				 * e.g. margin-left becomes marginLeft. 
				 * Hyphens are removed, and each word after the first begins with a capital letter.
				 * 
				 * @param hyphenatedValue { String } hyphenated string to be converted
				 * @return result { String } the camel case version of the string argument
				 */
			 	toCamelCase: function(hyphenatedValue) { 
					
					var result = hyphenatedValue.replace(/-\D/g, function(character) { 
						return character.charAt(1).toUpperCase(); 
					}); 
					
					return result;
					 
				}, 
				
				/**
				 * The toHyphens method performs the opposite conversion, taking a camel case string and converting it into a hyphenated one.
				 * e.g. marginLeft becomes margin-left
				 * 
				 * @param camelCaseValue { String } camel cased string to be converted
				 * @return result { String } the hyphenated version of the string argument
				 */
			 	toHyphens: function(camelCaseValue) { 
					
					var result = camelCaseValue.replace(/[A-Z]/g, function(character) { 
						return ('-' + character.charAt(0).toLowerCase()); 
					});
				
					return result; 

				},
				
				/**
				 * The following method truncates a string by the length specified.
				 * The second argument is the suffix (e.g. rather than ... you could have !!!)
				 *
				 * @param str { String } the string to 
				 * @param length { Integer } the length the string should be (if none specified a default is used)
				 * @param suffix { String } default value is ... but can be overidden with any number of characters
				 * @return { String } the modified String value
				 */
				truncate: function(str, length, suffix) {
					length = length || 30;
					suffix = (typeof suffix == "undefined") ? '...' : suffix;
					
					// If the string isn't longer than the specified cut-off length then just return the original string
					return (str.length > length) 
						// Otherwise, we borrow the String object's "slice()" method using the "call()" method
						? String.prototype.slice.call(str, 0, length - suffix.length) + suffix
						: str;
				},
				
				/**
				 * The following method inserts a specified element node into the DOM after the specified target element node.
				 * For some reason the DOM api provides different methods to acheive this functionality but no actual native method?
				 *
				 * @param newElement { Element/Node } new element node to be inserted
				 * @param targetElement { Element/Node } target element node where the new element node should be inserted after
				 * @return undefined {  } no explicitly returned value
				 */
				insertAfter: function(newElement, targetElement) {
					var parent = targetElement.parentNode;
					
					(parent.lastChild == targetElement) 
						? parent.appendChild(newElement) 
						: parent.insertBefore(newElement, targetElement.nextSibling);
					
				},
				
				/**
				 * The following method isn't callable via the 'utilities' namespace.
				 * It actually modifies the native Function object so as to mimic the functionality of new ECMAScript5 feature known as 'function binding'.
				 * Similar functionality can be carried out with the standard Function.apply/call, but bind() is more flexible and easier syntax.
				 *
				 * @reference https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
				 */
			 	bind: (function() { 
					
					if (!Function.prototype.bind) {
						Function.prototype.bind = function(obj) {
						
							var slice = [].slice,
								 args = slice.call(arguments, 1),
								 self = this,
								 nop = function(){},
								 bound = function() {
								 	return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
								 };
							
							nop.prototype = self.prototype;
							bound.prototype = new nop();
							return bound;

						};
					}
					
				}()),
				
				/**
				 * The following method is a Constructor with additional methods attached to the prototype
				 * which aid every time you need to check whether a property is present in an object.
				 * We approach an object as just a set of properties.
				 * And because we can use it to look things up by name, we will call it a 'Dictionary'.
				 * Lastly, as it's a constructor we'll use the correct naming convention of using a capitalised first letter.
				 *
				 * @notes for the prototype object see near bottom of script (after this __standardizer object definition has ended).
				 * @param {} x
				 * @return {} x
				 */
				Dictionary: function(startValues) {
					this.values =  startValues || {};
				}
				
			},
			
			css: {
			
				/**
				 * The getAppliedStyle method returns the current value of a specific CSS style property on a particular element
				 * 
				 * @param element { Element/Node } the element we wish to find the style value for
				 * @param styleName { String } the specific style property we're interested in
				 * @return style { String } the value of the style property found
				 */
			 	getAppliedStyle: function(element, styleName) {
			 	 
					var style = "";
					
					if (window.getComputedStyle) { 
						//  W3C specific method. Expects a style property with hyphens 
						style = element.ownerDocument.defaultView.getComputedStyle(element, null).getPropertyValue(__standardizer.utilities.toHyphens(styleName)); 
					} 
					
					else if (element.currentStyle) { 
						// Internet Explorer-specific method. Expects style property names in camel case 
						style = element.currentStyle[__standardizer.utilities.toCamelCase(styleName)]; 
					}
					  
					return style;
					
				},
				
				/**
				 * The getArrayOfClassNames method is a utility method which returns an array of all the CSS class names assigned to a particular element.
				 * Multiple class names are separated by a space character
				 * 
				 * @param element { Element/Node } the element we wish to retrieve class names for
				 * @return classNames { String } a list of class names separated with a space in-between
				 */
			 	getArrayOfClassNames: function(element) {
			 	
					var classNames = []; 
					
					if (element.className) { 
						// If the element has a CSS class specified, create an array 
						classNames = element.className.split(' '); 
					} 
					
					return classNames;
					
				},
				
				/**
				 * The addClass method adds a new CSS class of a given name to a particular element
				 * 
				 * @param element { Element/Node } the element we want to add a class name to
				 * @param className { String } the class name we want to add
				 * @return undefined {  } no explicitly returned value
				 */
			 	addClass: function(element, className) {
			 	
					// Get a list of the current CSS class names applied to the element 
					var classNames = this.getArrayOfClassNames(element); 
					
					// Make sure the class doesn't already exist on the element
				   if (this.hasClass(element, className)) {
				   	return;
				   }
				   
					// Add the new class name to the list 
					classNames.push(className);
					
					// Convert the list in space-separated string and assign to the element 
					element.className = classNames.join(' '); 
					
				},
				
				/**
				 * The removeClass method removes a given CSS class name from a given element
				 * 
				 * @param element { Element/Node } the element we want to remove a class name from
				 * @param className { String } the class name we want to remove
				 * @return undefined {  } no explicitly returned value
				 */
			 	removeClass: function(element, className) { 
			 	
					var classNames = this.getArrayOfClassNames(element),
						 resultingClassNames = []; // Create a new array for storing all the final CSS class names in 
			        
					for (var index = 0, len = classNames.length; index < len; index++) { 
					
						// Loop through every class name in the list 
						if (className != classNames[index]) { 
						
							// Add the class name to the new list if it isn't the one specified 
							resultingClassNames.push(classNames[index]); 
							
						} 
						
					}
					  
					// Convert the new list into a  space- separated string and assign it 
					element.className = resultingClassNames.join(" "); 
					
				},
				
				/**
				 * The hasClass method returns true if a given class name exists on a specific element, false otherwise
				 * 
				 * @param element { Element/Node } the element we want to check whether a class name exists on
				 * @param className { String } the class name we want to check for
				 * @return isClassNamePresent { Boolean } if class name was found or not
				 */
			 	hasClass: function(element, className) { 
			 	
					// Assume by default that the class name is not applied to the element 
					var isClassNamePresent = false,
						 classNames = this.getArrayOfClassNames(element); 
			        
					for (var index = 0, len = classNames.length; index < len; index++) { 
					
						// Loop through each CSS class name applied to this element 
						if (className == classNames[index]) { 
						
							// If the specific class name is found, set the return value to true 
							isClassNamePresent = true; 
							
						} 
						
					} 
			        
					// Return true or false, depending on if the specified class name was found 
					return isClassNamePresent; 
					
				}
				
			},
			
			/**
			 * The following method allows the user to animate any elements using CSS properties.
			 * It has been modified to check for native (or vendor prefixed) CSS3 transitions.
			 * 
			 * Original code by @thomasfuch (emile.js)
			 * IE<9 Opacity support by @kangax
			 * 
			 * @param el { Element/Node } the element that we want to animate
			 * @param style { String } a string of properties to animation (written in standard CSS syntax)
			 * @param opts { Object } user configuration settings
			 * @param after { Function } function to execute after the specified animation has completed
			 * @return { Function } immediately invoked function expression which returns a new Function
			 */
			animation: (function() {
				var thisBody = document.body || document.documentElement, 
					 thisStyle = thisBody.style, 
					 vendors,
					 hasCSSTransitions,
					 whichTransition,
					 cssTransitionsAnimation,
					 jsAnimation,
					 chosenAnimation;
				
				hasCSSTransitions = thisStyle.WebkitTransition !== undefined || 
							 			  thisStyle.MozTransition !== undefined || 
							 			  thisStyle.OTransition !== undefined || 
							 			  thisStyle.msTransition !== undefined || 
							 			  thisStyle.transition !== undefined;
				
				// CSS Transitions Animation Function...
				
				cssTransitionsAnimation = function(el, style, opts) {
					var opts = opts || {};
					
					// Assume the user wants CSS Transitions by default
					if (opts.cssTransition === undefined) {
						opts.cssTransition = true;
					}
					
					// If the user has specified for no CSS transitions to be used then rewrite function to use jsAnimation
					if (!opts.cssTransition) {
						chosenAnimation = jsAnimation;
						chosenAnimation(el, style, opts);
						return;
					}					
					
					// Otherwise continue with CSS Transition specific code...
					
					if (this.css.hasTransitions === undefined) {
			   		// These properties are only available after the function has been run once
				   	this.css.hasTransitions = true;
				   	this.css.whichTransition = whichTransition;
			   	}
			   	
			   	var el = (typeof el == 'string') ? document.getElementById(el) : el, // Either get the element by specified ID or just use the element node passed through
			   		 cleanWhitespace = style.replace(/\s/ig, ''),
			   		 settings = cleanWhitespace.split(';'),
			   		 len = settings.length,
			   		 arr = [],
			   		 duration = (opts.duration) ? ((opts.duration / 1000) + 's') : '0.5s',
			   		 easing = opts.easing || 'linear',
			   		 compileString = '',
			   		 i,
			   		 polling,
			   		 animationComplete = false;
			   	
			   	// Create an Array of settings...
			   	// ["left", "-176px"] ["opacity", "0.5"]
			   	for (i = 0; i < len-1; i++) {
			   		arr.push(settings[i].split(':'));
			   	}
			   	
			   	// Compile transition string
			   	for (i = 0, len = arr.length; i < len; i++) {
			   		compileString += arr[i][0] + ' ' + duration + ' ' + easing;
			   		
			   		// Only add trailing space as long as it's not the last property being set
			   		if (i+1 !== len) {
			   			compileString += ', ';
			   		}
			   	}
			   	
			   	// Set the relevant transition (e.g. WebkitTransition) to have a specific value
			   	el.style[whichTransition] = compileString;
			   	
			   	// Add custom data-* attribute to tell when element is animating
					el.setAttribute('data-anim', 'true');
			   	
			   	// Loop through each property the user has specified to be animated and set the 'style' property manually
			   	for (i = 0; i <= len; i++) {
			   		for (item in arr) {
			   			el.style[arr[item][0]] = arr[item][1];
			   		}
			   	}
			   	
			   	el.addEventListener('webkitTransitionEnd', checkTransitionEnd, false); // Webkit
			   	el.addEventListener('transitionend', checkTransitionEnd, false); // Mozilla
			   	el.addEventListener('OTransitionEnd', checkTransitionEnd, false); // Opera
			   	
			   	// Some browsers support CSS3 transitions but NOT any event listeners for the transition's end!
			   	// So we'll have to use polling to work around this (not ideal I know)
			   	polling = window.setTimeout(function() {
			   		animationComplete = true;
			   		clearTimeout(polling);
			   		el.removeAttribute('data-anim');
			   		opts.after && opts.after(); // execute callback if one has been provided
			   	}, (opts.duration + 200)); // I've added an extra 200 milliseconds onto the timeout in case the animation was slow
			   	
			   	// Check for transition end and then run callback (if one provided)
			   	function checkTransitionEnd(e) {
			   		if (!animationComplete) {
			   			clearTimeout(polling);
			   			animationComplete = true;
			   			el.removeAttribute('data-anim');
			   			opts.after && opts.after(); // execute callback if one has been provided
			   		}
			   		
						el.removeEventListener('webkitTransitionEnd', checkTransitionEnd, false); // Webkit
			   		el.removeEventListener('transitionend', checkTransitionEnd, false); // Mozilla
			   		el.removeEventListener('OTransitionEnd', checkTransitionEnd, false); // Opera
			   	}
				};
				
				// Js Animation Function...
				
				jsAnimation = function(el, style, opts, after) {
					var parseEl = document.createElement('div'),
						 isIE = !!window.attachEvent && !window.opera,
						 props = ('backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth '+
					 				 'borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize '+
					 				 'fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight '+
					 				 'maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft '+
					 				 'paddingRight paddingTop right textIndent top width wordSpacing zIndex').split(' '),
					
					// Internet Explorer < 9 support for Opacity (via @kangax)...
					
					 				 supportsOpacity = typeof parseEl.style.opacity == 'string',
					 				 supportsFilters = typeof parseEl.style.filter == 'string',
					 				 reOpacity = /alpha\(opacity=([^\)]+)\)/,
					 				 setOpacity = function(){ },
					 				 getOpacityFromComputed = function(){ return '1'; };
					 				 
					if (supportsOpacity) {
						setOpacity = function(el, value) {
							el.style.opacity = value;
						};
						
						getOpacityFromComputed = function(computed) { 
							return computed.opacity; 
						};
					}
					else if (supportsFilters) {
						setOpacity = function(el, value) {
							var es = el.style;
							
							// If the element doesn't have 'hasLayout' triggered then make sure it is forced via the 'zoom' style hack
							if(!el.currentStyle.hasLayout) { 
								es.zoom = 1;						
							}
							
							if (reOpacity.test(es.filter)) {
								value = value >= 0.9999 ? '' : ('alpha(opacity=' + (value * 100) + ')');
								es.filter = es.filter.replace(reOpacity, value);
							} else {
								es.filter += ' alpha(opacity=' + (value * 100) + ')';
							}
						};
						
						getOpacityFromComputed = function(comp) {
							var m = comp.filter.match(reOpacity);
							return (m ? (m[1] / 100) : 1) + '';
						};
					}
					
					var easings = {
						easeOut: function(pos) {
							return Math.sin(pos * Math.PI / 2);
						},
						
						easeOutStrong: function(pos) {
							return (pos == 1) ? 1 : 1 - Math.pow(2, -10 * pos);
						},
						
						easeIn: function(pos) {
							return pos * pos;
						},
						
						easeInStrong: function(pos) {
							return (pos == 0) ? 0 : Math.pow(2, 10 * (pos - 1));
						},
						
						bounce: function(pos) {
							if (pos < (1 / 2.75)) {
								return 7.5625 * pos * pos;
							}
							if (pos < (2 / 2.75)) {
								return 7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75;
							}
							if (pos < (2.5 / 2.75)) {
								return 7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375;
							}
							return 7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375;
						},
						
						linear: function(pos) {
							return (-Math.cos(pos * Math.PI) / 2) + 0.5;
						},
						
						sine: function(pos) {
							return (Math.sin(pos * Math.PI / 2));
						},
						
						flicker: function(pos) {
							return ((-Math.cos(pos * Math.PI) / 4) + 0.75) + Math.random() * 0.25;
						},
						
						wobble: function(pos) {
							return (-Math.cos(pos * Math.PI * (9 * pos)) / 2) + 0.5;
						},
						
						pulsate: function(pos) {
							return (0.5 + Math.sin(17 * pos) / 2);
						},
						
						expo: function(pos) {
							return Math.pow(2, 8 * (pos - 1));
						},
						
						quad: function(pos) {
							return Math.pow(pos, 2);
						},
						
						cube: function(pos) {
							return Math.pow(pos, 3);
						}
					};
					
					function interpolate(source, target, pos) { 
						return (source+(target-source)*pos).toFixed(3); 
					}
					
					function s(str, p, c) { 
						return str.substr(p,c||1);
					}
					
					function color(source,target,pos) {
						var i = 2, 
							 j, 
							 c, 
							 tmp, 
							 v = [], 
							 r = [];
						
						while (j=3,c=arguments[i-1],i--) {					
							if (s(c,0)=='r') { 
								c = c.match(/\d+/g); while(j--) v.push(~~c[j]);
							}
							else {
								if(c.length==4) {
									c='#'+s(c,1)+s(c,1)+s(c,2)+s(c,2)+s(c,3)+s(c,3);
								}
								while (j--) {
									v.push(parseInt(s(c,1+j*2,2), 16)); 
								}
							}
						}
						
						while (j--) { 
							tmp = ~~(v[j+3]+(v[j]-v[j+3])*pos); r.push(tmp<0?0:tmp>255?255:tmp); 
						}
						
						return 'rgb('+r.join(',')+')';
					}
					
					function parse(val) {
						var v = parseFloat(val), 
							 q = val.replace(/^[\-\d\.]+/,'');
						
						// If a colour value...
						if (isNaN(v)) {
							return { v: q, f: color, u: ''};
						} else {
							return { v: v, f: interpolate, u: q };
						}
					}
					
					function normalize(style) {
						var css, 
							 rules = {}, 
							 i = props.length, 
							 v;
							 
						parseEl.innerHTML = '<div style="'+style+'"></div>';
						
						css = parseEl.childNodes[0].style;
						
						while(i--) {
							
							if(v = css[props[i]]) {
								rules[props[i]] = parse(v, props[i]);
							}
						}
						
						return rules;
					}
					
					// Either get the element by specified ID or just use the element node passed through
					var el = (typeof el == 'string') ? document.getElementById(el) : el,
						 opts = opts || {};
					
					// Add custom data-* attribute to tell when element is animating
					el.setAttribute('data-anim', 'true');
					
					var target = normalize(style), 
						 comp = el.currentStyle ? el.currentStyle : getComputedStyle(el, null),
						 prop, 
						 current = {}, 
						 start = +new Date, 
						 dur = parseInt(opts.duration) || 200, 
						 finish = start+dur, 
						 interval,
						 curValue,
						 easing = opts.easing || easings.linear; // 'linear' is actually 'cosine' but changed name for compatibility with CSS3 transitions (linear is the default easing effect)
						 
					// Modification made to include different easing styles
					switch (easing) {
						case 'ease-Out':
							easing = easings.easeOut;
							break;
						case 'easeOutStrong':
							easing = easings.easeOutStrong;
							break;
						case 'ease-In':
							easing = easings.easeIn;
							break;
						case 'easeInStrong':
							easing = easings.easeInStrong;
							break;
						case 'bounce':
							easing = easings.bounce;
							break;
						case 'linear':
							easing = easings.linear;
							break;
						case 'sine':
							easing = easings.sine;
							break;
						case 'flicker':
							easing = easings.flicker;
							break;
						case 'wobble':
							easing = easings.wobble;
							break;
						case 'pulsate':
							easing = easings.pulsate;
							break;
						case 'expo':
							easing = easings.expo;
							break;
						case 'quad':
							easing = easings.quad;
							break;
						case 'cube':
							easing = easings.cube;
							break;
					}
					
					for (val in target) {
						current[val] = parse(val === 'opacity' ? getOpacityFromComputed(comp) : comp[val]);
					}
					
					// Code to position element
					function render() {
						var time = +new Date, 
							 pos = time>finish ? 1 : (time-start)/dur,
							 animating = true;
					  
						for(prop in target) {
							curValue = target[prop].f(current[prop].v, target[prop].v, easing(pos)) + target[prop].u;
							if (prop === 'opacity') {
								setOpacity(el, curValue);
							} else {
								el.style[prop] = curValue;
							}
						}
						
						if(time > finish) { 
							el.removeAttribute('data-anim');
							clearInterval(interval); 
							opts.after && opts.after(); 
							after && setTimeout(after, 1);
						}
					}
					
					interval = setInterval(render, 10);
				};
				
				// CSS Transitions Specific Set-up Code
				
				if (hasCSSTransitions) {
					vendors = {
				    	'WebkitTransition': thisStyle.WebkitTransition !== undefined,
				    	'MozTransition': thisStyle.MozTransition !== undefined,
				    	'OTransition': thisStyle.OTransition !== undefined,
				    	'msTransition': thisStyle.msTransition !== undefined,
				    	'transition': thisStyle.transition !== undefined
					}
					
					for (prop in vendors) {
				   	if (vendors.hasOwnProperty(prop)) {
				   		if (vendors[prop]) {
				   			whichTransition = prop;
				   		}
				   	}
				   }
					
					chosenAnimation = cssTransitionsAnimation;
				} 
				
				// JsAnimation Specific Set-up Code
				
				else {
					chosenAnimation = jsAnimation;
				}
				
				return chosenAnimation;
				
				/*
				if (hasCSSTransitions) {
					
					vendors = {
				    	'WebkitTransition': thisStyle.WebkitTransition !== undefined,
				    	'MozTransition': thisStyle.MozTransition !== undefined,
				    	'OTransition': thisStyle.OTransition !== undefined,
				    	'msTransition': thisStyle.msTransition !== undefined,
				    	'transition': thisStyle.transition !== undefined
					}
					
					for (prop in vendors) {
				   	if (vendors.hasOwnProperty(prop)) {
				   		if (vendors[prop]) {
				   			whichTransition = prop;
				   		}
				   	}
				   }
				   
				   return function(el, style, opts) {
				   	
				   	if (this.css.hasTransitions === undefined) {
				   		// These properties are only available after the function has been run once
					   	this.css.hasTransitions = true;
					   	this.css.whichTransition = whichTransition;
				   	}
				   	
				   	var el = (typeof el == 'string') ? document.getElementById(el) : el, // Either get the element by specified ID or just use the element node passed through
				   		 opts = opts || {},
				   		 cleanWhitespace = style.replace(/\s/ig, ''),
				   		 settings = cleanWhitespace.split(';'),
				   		 len = settings.length,
				   		 arr = [],
				   		 duration = (opts.duration) ? ((opts.duration / 1000) + 's') : '0.5s',
				   		 easing = opts.easing || 'linear',
				   		 compileString = '',
				   		 i,
				   		 polling,
				   		 animationComplete = false;
				   	
				   	// Create an Array of settings...
				   	// ["left", "-176px"] ["opacity", "0.5"]
				   	for (i = 0; i < len-1; i++) {
				   		arr.push(settings[i].split(':'));
				   	}
				   	
				   	// Compile transition string
				   	for (i = 0, len = arr.length; i < len; i++) {
				   		compileString += arr[i][0] + ' ' + duration + ' ' + easing;
				   		
				   		// Only add trailing space as long as it's not the last property being set
				   		if (i+1 !== len) {
				   			compileString += ', ';
				   		}
				   	}
				   	
				   	// Set the relevant transition (e.g. WebkitTransition) to have a specific value
				   	el.style[whichTransition] = compileString;
				   	
				   	// Add custom data-* attribute to tell when element is animating
						el.setAttribute('data-anim', 'true');
				   	
				   	// Loop through each property the user has specified to be animated and set the 'style' property manually
				   	for (i = 0; i <= len; i++) {
				   		for (item in arr) {
				   			el.style[arr[item][0]] = arr[item][1];
				   		}
				   	}
				   	
				   	el.addEventListener('webkitTransitionEnd', checkTransitionEnd, false); // Webkit
				   	el.addEventListener('transitionend', checkTransitionEnd, false); // Mozilla
				   	el.addEventListener('OTransitionEnd', checkTransitionEnd, false); // Opera
				   	
				   	// Some browsers support CSS3 transitions but NOT any event listeners for the transition's end!
				   	// So we'll have to use polling to work around this (not ideal I know)
				   	polling = window.setTimeout(function() {
				   		animationComplete = true;
				   		clearTimeout(polling);
				   		el.removeAttribute('data-anim');
				   		opts.after && opts.after(); // execute callback if one has been provided
				   	}, (opts.duration + 200)); // I've added an extra 200 milliseconds onto the timeout in case the animation was slow
				   	
				   	// Check for transition end and then run callback (if one provided)
				   	function checkTransitionEnd(e) {
				   		if (!animationComplete) {
				   			clearTimeout(polling);
				   			animationComplete = true;
				   			el.removeAttribute('data-anim');
				   			opts.after && opts.after(); // execute callback if one has been provided
				   		}
				   		
							el.removeEventListener('webkitTransitionEnd', checkTransitionEnd, false); // Webkit
				   		el.removeEventListener('transitionend', checkTransitionEnd, false); // Mozilla
				   		el.removeEventListener('OTransitionEnd', checkTransitionEnd, false); // Opera
				   	}
				   	
				   };
					
				} 
				
				// Native (or vendor prefixed) CSS3 transitions aren't supported so we'll refer to a modified version of the emilejs library
				else {
				
					var parseEl = document.createElement('div'),
						 isIE = !!window.attachEvent && !window.opera,
						 props = ('backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth '+
					 				 'borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize '+
					 				 'fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight '+
					 				 'maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft '+
					 				 'paddingRight paddingTop right textIndent top width wordSpacing zIndex').split(' '),
					
					// Internet Explorer < 9 support for Opacity (via @kangax)...
					
					 				 supportsOpacity = typeof parseEl.style.opacity == 'string',
					 				 supportsFilters = typeof parseEl.style.filter == 'string',
					 				 reOpacity = /alpha\(opacity=([^\)]+)\)/,
					 				 setOpacity = function(){ },
					 				 getOpacityFromComputed = function(){ return '1'; };
					 				 
					if (supportsOpacity) {
						setOpacity = function(el, value) {
							el.style.opacity = value;
						};
						
						getOpacityFromComputed = function(computed) { 
							return computed.opacity; 
						};
					}
					else if (supportsFilters) {
						setOpacity = function(el, value) {
							var es = el.style;
							
							// If the element doesn't have 'hasLayout' triggered then make sure it is forced via the 'zoom' style hack
							if(!el.currentStyle.hasLayout) { 
								es.zoom = 1;						
							}
							
							if (reOpacity.test(es.filter)) {
								value = value >= 0.9999 ? '' : ('alpha(opacity=' + (value * 100) + ')');
								es.filter = es.filter.replace(reOpacity, value);
							} else {
								es.filter += ' alpha(opacity=' + (value * 100) + ')';
							}
						};
						
						getOpacityFromComputed = function(comp) {
							var m = comp.filter.match(reOpacity);
							return (m ? (m[1] / 100) : 1) + '';
						};
					}
					
					var easings = {
						easeOut: function(pos) {
							return Math.sin(pos * Math.PI / 2);
						},
						
						easeOutStrong: function(pos) {
							return (pos == 1) ? 1 : 1 - Math.pow(2, -10 * pos);
						},
						
						easeIn: function(pos) {
							return pos * pos;
						},
						
						easeInStrong: function(pos) {
							return (pos == 0) ? 0 : Math.pow(2, 10 * (pos - 1));
						},
						
						bounce: function(pos) {
							if (pos < (1 / 2.75)) {
								return 7.5625 * pos * pos;
							}
							if (pos < (2 / 2.75)) {
								return 7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75;
							}
							if (pos < (2.5 / 2.75)) {
								return 7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375;
							}
							return 7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375;
						},
						
						linear: function(pos) {
							return (-Math.cos(pos * Math.PI) / 2) + 0.5;
						},
						
						sine: function(pos) {
							return (Math.sin(pos * Math.PI / 2));
						},
						
						flicker: function(pos) {
							return ((-Math.cos(pos * Math.PI) / 4) + 0.75) + Math.random() * 0.25;
						},
						
						wobble: function(pos) {
							return (-Math.cos(pos * Math.PI * (9 * pos)) / 2) + 0.5;
						},
						
						pulsate: function(pos) {
							return (0.5 + Math.sin(17 * pos) / 2);
						},
						
						expo: function(pos) {
							return Math.pow(2, 8 * (pos - 1));
						},
						
						quad: function(pos) {
							return Math.pow(pos, 2);
						},
						
						cube: function(pos) {
							return Math.pow(pos, 3);
						}
					};
					
					function interpolate(source, target, pos) { 
						return (source+(target-source)*pos).toFixed(3); 
					}
					
					function s(str, p, c) { 
						return str.substr(p,c||1);
					}
					
					function color(source,target,pos) {
						var i = 2, 
							 j, 
							 c, 
							 tmp, 
							 v = [], 
							 r = [];
						
						while (j=3,c=arguments[i-1],i--) {					
							if (s(c,0)=='r') { 
								c = c.match(/\d+/g); while(j--) v.push(~~c[j]);
							}
							else {
								if(c.length==4) {
									c='#'+s(c,1)+s(c,1)+s(c,2)+s(c,2)+s(c,3)+s(c,3);
								}
								while (j--) {
									v.push(parseInt(s(c,1+j*2,2), 16)); 
								}
							}
						}
						
						while (j--) { 
							tmp = ~~(v[j+3]+(v[j]-v[j+3])*pos); r.push(tmp<0?0:tmp>255?255:tmp); 
						}
						
						return 'rgb('+r.join(',')+')';
					}
					
					function parse(val) {
						var v = parseFloat(val), 
							 q = val.replace(/^[\-\d\.]+/,'');
						
						// If a colour value...
						if (isNaN(v)) {
							return { v: q, f: color, u: ''};
						} else {
							return { v: v, f: interpolate, u: q };
						}
					}
					
					function normalize(style) {
						var css, 
							 rules = {}, 
							 i = props.length, 
							 v;
							 
						parseEl.innerHTML = '<div style="'+style+'"></div>';
						
						css = parseEl.childNodes[0].style;
						
						while(i--) {
							
							if(v = css[props[i]]) {
								rules[props[i]] = parse(v, props[i]);
							}
						}
						
						return rules;
					}
					
					return function(el, style, opts, after) {
						// Either get the element by specified ID or just use the element node passed through
						el = (typeof el == 'string') ? document.getElementById(el) : el;
						opts = opts || {};
						
						// Add custom data-* attribute to tell when element is animating
						el.setAttribute('data-anim', 'true');
						
						var target = normalize(style), 
							 comp = el.currentStyle ? el.currentStyle : getComputedStyle(el, null),
							 prop, 
							 current = {}, 
							 start = +new Date, 
							 dur = parseInt(opts.duration) || 200, 
							 finish = start+dur, 
							 interval,
							 curValue,
							 easing = opts.easing || easings.linear; // 'linear' is actually 'cosine' but changed name for compatibility with CSS3 transitions (linear is the default easing effect)
							 
						// Modification made to include different easing styles
						switch (easing) {
							case 'ease-Out':
								easing = easings.easeOut;
								break;
							case 'easeOutStrong':
								easing = easings.easeOutStrong;
								break;
							case 'ease-In':
								easing = easings.easeIn;
								break;
							case 'easeInStrong':
								easing = easings.easeInStrong;
								break;
							case 'bounce':
								easing = easings.bounce;
								break;
							case 'linear':
								easing = easings.linear;
								break;
							case 'sine':
								easing = easings.sine;
								break;
							case 'flicker':
								easing = easings.flicker;
								break;
							case 'wobble':
								easing = easings.wobble;
								break;
							case 'pulsate':
								easing = easings.pulsate;
								break;
							case 'expo':
								easing = easings.expo;
								break;
							case 'quad':
								easing = easings.quad;
								break;
							case 'cube':
								easing = easings.cube;
								break;
						}
						
						for (val in target) {
							current[val] = parse(val === 'opacity' ? getOpacityFromComputed(comp) : comp[val]);
						}
						
						// Code to position element
						function render() {
							var time = +new Date, 
								 pos = time>finish ? 1 : (time-start)/dur,
								 animating = true;
						  
							for(prop in target) {
								curValue = target[prop].f(current[prop].v, target[prop].v, easing(pos)) + target[prop].u;
								if (prop === 'opacity') {
									setOpacity(el, curValue);
								} else {
									el.style[prop] = curValue;
								}
							}
						
							if(time > finish) { 
								el.removeAttribute('data-anim');
								clearInterval(interval); 
								opts.after && opts.after(); 
								after && setTimeout(after, 1);
							}
						}
						
						interval = setInterval(render, 10);
					};

				}*/
				
			}()),
			
			/**
			 * An event emitter facility which provides the observer(Publisher/Subscriber) design pattern to javascript objects
			 * Doesn't rely on the browser DOM. Super Simple.
			 *
			 * Modified from: 
			 * https://github.com/jeromeetienne/microevent.js/blob/master/microevent.js
			 *
			 * @notes All methods are added via the prototype chain (see below)
			 */
		 	observer: function(){}
			
		};
		
		__standardizer.observer.prototype = {
			
			bind: function(event, fct) {
			
				this._events = this._events || {};
				this._events[event] = this._events[event]	|| [];
				this._events[event].push(fct);
				
			},
			
			unbind: function(event, fct) {
			
				this._events = this._events || {};
				
				if( event in this._events === false) {	
					return;
				}
				
				this._events[event].splice(this._events[event].indexOf(fct), 1);
				
			},
			
			trigger: function(event /* , args... */) {
				
				this._events = this._events || {};
				
				if (event in this._events === false) {
					return
				};
				
				for(var i = 0; i < this._events[event].length; i++) {
					this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
				}
				
			}
			
		};
		
		/**
		 * This method will delegate all event emitter functions to the destination object
		 *
		 * @param destObject { Object } the object which will support MicroEvent
		 * @return undefined {  } no explicitly returned value
		 */
		__standardizer.observer.mixin = function(destObject) {
		
			var props	= ['bind', 'unbind', 'trigger'];
			
			for(var i = 0; i < props.length; i ++){
				destObject.prototype[props[i]] = __standardizer.observer.prototype[props[i]];
			}
			
		}
		
		// Here follows is the prototype for the Dictionary Constructor
		// See: __standardizer.utilities.dictionary
		__standardizer.utilities.Dictionary.prototype = {
			
			/**
			 * s
			 * 
			 * @param name {} x
			 * @param value {} x
			 * @return 
			 */
			store: function(name, value) {
				this.values[name] = value;
			},
			
			/**
			 * s
			 * 
			 * @param name {} x
			 * @return
			 */
			lookup: function(name) {
				return this.values[name];
			},
			
			/**
			 * s
			 * 
			 * @param name {} x
			 * @return
			 */
			contains: function(name) {
				return Object.prototype.hasOwnProperty.call(this.values, name) && 
						 Object.prototype.propertyIsEnumerable.call(this.values, name);
			},
			
			/**
			 * The following method executes a function for every property in this object.
			 * 
			 * @param action { Function } a user specified callback function to execute for each property in this object
			 * @return undefined {  } no explicitly returned value
			 */
			each: function(action) {
				var object = this.values;
				for (var property in object) {
					if (object.hasOwnProperty(property)) {
						action(property, object[property]);
					}
				}
			},
			
			/**
			 * The following method returns an Array of all property names within an object.
			 * 
			 * @return names { Array } a list of all property names in this object
			 */
			names: function() {
				var names = [];
				
				this.each(function(name, value) {
					names.push(name);
				});
				
				return names;
			}
			
		};
	
		// Return public API
		return {
			load: __standardizer.domready,
			ajax: __standardizer.ajax,
			events: __standardizer.events,
			utils: __standardizer.utilities,
			css: __standardizer.css,
			observe: __standardizer.observer,
			anim: __standardizer.animation,
			find: Sizzle // Integrates the Sizzle CSS Selector Engine (http://sizzlejs.com/) as used by jQuery and other Js Frameworks
		};
		
	}());
	
	// Expose st to the global object
	window.st = standardizer;
	
}(this, this.document));