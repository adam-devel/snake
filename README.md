A simple snake game for terminals.

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/adam-devel/snake/main/demo/light.png" media="(prefers-color-scheme: light)">
    <source srcset="https://raw.githubusercontent.com/adam-devel/snake/main/demo/dark.png" media="(prefers-color-scheme: dark)">
    <img src="https://raw.githubusercontent.com/adam-devel/snake/main/demo/light.png" alt="" />
  </picture>
</p>

# Purpose

This game is an excuse to play around with terminals and master rendering stuff
on them.
Also -- being a side project -- i can afford wasting time writing and rewriting
code until i am relatively statisfied.
This game is written in javascript on top of nodejs's APIs, it's not the best
fit for the job but the purpose isn't mastering new languages, or using the
right tool. so i used the language i am most comfortable using.

# IO is slow

The naive approach would be sending the escape sequences necessary for
rendering a frame directly to the terminal. You notice the slowness of this
approach immediately as flickering becomes an issue. IO has an overhead and its
delaying the rendering of the frame serveral times in the middle of rendering
(in between rendering commands).

# The Solution: Buffering

Instead of sending rendering commands as they come, we can accumilate into a buffer all the
escape sequences necessary for rendering a single frame. then we can send the entire frame in one go.
that way we only do IO when necessay: in between frames.

This makes things noticeably faster.

# Escape sequences are slow

The next level is noticing that using escape sequences as a graphics language
running on top of an emulated terminal is a bad idea. Even with minimum IO, we
are still writing code (the program) that writes code (escape sequences) that
instructs a terminal emulator to move the cursor around and overwrite a character.

You discover this when using too many escape sequences within a frame (to
inefficiently draw a grid for example), causes noticeable flickering.

# Offscreen canvas

Instead of running code to write code for the terminal to run.
We can just directly write to our buffer.
That is, instead of writing an instruction to move the cursor to some location and draw a character,
we can instead write the character into the frame at that location by ourselves, then send the final result to the terminal.

In addition to improving rendering performance, this approach drops the need for terminals to support
most escape sequenes, making the program compatible with virtually all terminal emulators

I haven't implemented this yet. i might do so when i feel like it.
