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
* Basic Utilities (toCamelCase, toHyphens)
* CSS methods (getAppliedStyle, addClass, removeClass, hasClass)
* Animations library
* Event Emitter
* CSS Selector Engine (aka Sizzle)

Upcoming Features
-----------------

* Event Delegation Method
* History Management

Each feature can easily be deleted without affecting any others (except for the CSS methods which do require the basic utilities 'toCamelCase' and 'toHyphens'.