[Integralist](http://www.integralist.co.uk/) - Stand.ard.iz.er
================================

Description
-----------

Jumping on the bandwagon with the intent on helping improve my JavaScript knowledge.

Seems 'micro-frameworks' are all the rage now, and although this isn't a micro-framework (it's just a small framework) I've decided to try and write a framework that includes all the functionality I use on a daily basis in my web development work.

Yes of course jQuery has every functionality imaginable, and also a plugin architecture that fills any gaps it may have. But I don't like the fact that if you need some functionality (such as animation or ajax) you need the ENTIRE jQuery framework. I want something more modular.

With this framework I can strip out any features that aren't required and can add to it as required. It wont include loads of features, just the sort of things I need on a regular basis.

As time goes on I'll add other useful functions but the beauty is that they can be easily removed (in fact I would highly recommend being 'pro-active' and going through this library removing modules you don't need every time you start up a new project).

Features
--------

* Robust DOM Ready function
* AJAX handler
* Event Management (with normalised event object)
* Basic Utilities (toCamelCase, toHyphens, truncate, insertAfter, bind, Dictionary)
* CSS methods (getAppliedStyle, addClass, removeClass, hasClass, hasTransitions, whichTransition)
* Animations library (inc. CSS3 Transitions support, with fallback to 'plain vanilla' JavaScript)
* Event Emitter
* CSS Selector Engine (aka Sizzle... jQuery's selector engine)

Upcoming Features
-----------------

* Event Delegation Method
* History Management

Modular
--------

It's not really modular in the context of CommonJs 'modules'. What I mean by modular is that nearly every feature can easily be deleted without affecting any others (except for the CSS methods which do require the basic utilities 'toCamelCase' and 'toHyphens'). 

But to be fair if you're looking at this library you're not looking for something like jQuery (which hides all this away from you), so you're likely going to be at least fairly comfortable with 'plain vanilla' JavaScript and if you are then you wont have an issue removing any modules that don't fit your requirements.

And if you're not overly familiar with 'plain vanilla' JavaScript then this library will at least be readable to you as you learn. The most annoying aspect for me looking through the jQuery source code is trying to understand the API and trying to follow along a complicated function that jumps between different API methods just makes it so much more complicated than looking through a similar interface written with normal JavaScript.

Size
-----
At the moment it's around 53k (original source) and approx 12k minified (+ even smaller when you use GZIP!) and on top of that you might not need all the included features so it'll be even less!

Concerns?
---------

The argument about 'micro-library vs framework' rages on (and likely always will do).

Yes we've regressed slightly back to the late 90's where individual scripts were all the rage and inconsistencies run amok.

But we're also a better educated community and we've realised that we need to write better code so although there will be elements from the 'old days' cropping up every now and then, I think the 'micro-library' phase might have a foot hold for a while yet.

Some developers argue against 'micro-libraries' saying they push inconsistent browser support and programming API's/idioms (which is very true). But I'm of the mind that if you understand these concerns and are happy with the situation then so be it, as long as YOUR target audience is catered for then there should be no issue? So what if the micro-lib I've included doesn't work on browser 'x', that's not my target audience for the project I'm working on. And when browser 'x' does become a requirement then I'll modify the code and enhance it as necessary and if I'm unable to do it (for whatever reason) then I'll have to find another micro-lib that can - but remember that this is your industry, your business to know this stuff, if you can't augment a script to fit your needs then you should learn how to, that's your responsibility to your users.