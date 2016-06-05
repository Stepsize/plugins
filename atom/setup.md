## Installing the Layer Atom plugin

#### The right way – terminal command

`cd ~/.atom/packages && wget https://github.com/Stepsize/plugins/archive/master.zip && unzip master.zip && mv plugins-master/atom/stepsize . && rm -rf master.zip && rm -rf plugins-master`

Restart Atom after running this command and you're good to go!

Note: if somehow your Atom support directory is not located at `~/.atom`, change the first part of the command to match your setup.

#### The manual way – clicking, dragging & dropping

- Download the Stepsize plugin zip file [here](https://github.com/Stepsize/plugins/archive/master.zip)
- Find it in your downloads directory and double click to unzip it – it will create a directory called `plugins-master`
- Inside it that directory, there's a directory named `atom`, and inside this one a directory named `stepsize`
  - Copy the `stepsize` directory
  - Find your Atom packages directory – by default, it's in your home directory `~/.atom/packages`
  - Paste the `stepsize` directory inside the atom `packages` directory
- Restart Atom

You're good to go!
