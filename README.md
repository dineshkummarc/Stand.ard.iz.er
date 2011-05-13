[Integralist](http://www.integralist.co.uk/) - Stand.ard.iz.er
================================

Description
-----------

Jumping on the bandwagon with the intent on helping improve my JavaScript knowledge.

Seems 'micro-frameworks' are all the rage now, and although this isn't a micro-framework (it's just a small framework) I've decided to try and write a framework that includes all the functionality I use on a daily basis in my web development work.

Yes of course jQuery has every functionality imaginable, and also a plugin architecture that fills any gaps it may have. But I don't like the fact that if you need some functionality (such as animation or ajax) you need the ENTIRE jQuery framework. I want something more modular.

With this framework I can strip out any features that aren't required and can add to it as required. It wont feature loads of features, just the sort of things I need on a regular basis.

Features
--------

* Robust DOM Ready function
* AJAX handler
* Event Management (with normalised event object)
* Basic Utilities (toCamelCase, toHyphens, truncate, insertAfter, bind)
* CSS methods (getAppliedStyle, addClass, removeClass, hasClass, hasTransitions, whichTransition)
* Animations library (inc. CSS3 Transitions support, with fallback to 'plain vanilla' JavaScript)
* Event Emitter
* CSS Selector Engine (aka Sizzle... jQuery's selector engine)

Upcoming Features
-----------------

* Event Delegation Method
* History Management

Modular?
--------

Most features can easily be deleted without affecting any others (except for the CSS methods which do require the basic utilities 'toCamelCase' and 'toHyphens'). But to be fair if you're looking at this library you're not looking for a library like jQuery to hide all this away from you, so you should be at least fairly comfortable with 'plain vanilla' JavaScript and if you are then you wont have an issue removing any modules that don't fit your requirements.

Size?
-----
At the moment it's around 47k (original source) and approx 12k minified (+ even smaller when you use GZIP!) and on top of that you might not need all the included features so it'll be even less!