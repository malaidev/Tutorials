## Rune

**_Rune_** is a core piece of our technology that allows developers to create
*tinyML applications as containers. Think docker but much tinier. **_Rune_** is
*an orchestration tool for specifying how data should be processed, with an
*emphasis on the machine learning world, in a way which is portable and robust.

The main purpose of a Rune is to give developers in the fields of machine
learning and data processing a way to declare how data should be transformed
using a high level, declarative language. Instead of needing to write code that
manipulates data or needs to interface with complex third party libraries for
receiving inputs, you write a **Runefile** which declares each processing step
and defers their implementation to the Rune runtime. This runtime then takes
care of interfacing with the outside world and can leverage existing third party
libraries for data manipulation.

One of the applications that prompted Rune's creation was machine learning. In
machine learning there are often several pre- and post-processing steps required
to turn inputs into a form that is usable for a machine learning model and
interpreting the results. These steps tend to be a distraction from the actual
machine learning and are often cumbersome or boring to implement, so Rune comes
with several built-in facilities specific to ML.

The magic behind Runes is that they get compiled to a WebAssembly library which
is loaded by a WebAssembly runtime for execution. This means any platform which
can run WebAssembly can run a Rune. You can call a Rune from JavaScript in the
browser, integrate it into a mobile app, or even use a lightweight WebAssembly
runtime to run your Rune on memory constrained environments like an Arduino or
STM32.

A big part of using WebAssembly is that the Rune is entirely sandboxed from the
outside world. A faulty Rune can't accidentally bring down the rest of the
application and can only access resources explicitly given to it by the Rune
runtime. Both the Rune runtime and the Rune itself are written in **Rust**. This
lets us leverage the language's strong type system and concepts like unsafe and
the borrow checker to ensure correctness and protect against a lot of memory and
concurrency bugs found in other systems languages.

## Rune Playground

This is a `rune` playground which comes with `rune` pre-installed which you can
access using GitPod.

You can click on the below button to open GitPod on your browser.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/hotg-ai/tutorials)

## Loading your Runes on the Mobile App

Consider getting the Rune app and using `rune-serve {your-rune}.rune` to load your Rune on the phone!!!

1. [iOS](https://apps.apple.com/us/app/runic-by-hotg-ai/id1550831458)
2. [Android](https://play.google.com/store/apps/details?id=ai.hotg.runicapp&hl=en_US&gl=US)