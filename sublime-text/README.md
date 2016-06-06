## Installing the Stepsize Layer plugin for Sublime Text

The plugin works for both Sublime Text 2 & 3.

#### The right way – terminal command

`wget https://github.com/Stepsize/plugins/archive/master.zip && unzip master.zip && pushd plugins-master/sublime-text && make && popd && rm -rf master.zip plugins-master`

Restart Sublime Text after running this command and you're good to go!

#### The manual way – clicking, dragging & dropping

- Download the Stepsize Layer plugin zip file [here](https://github.com/Stepsize/plugins/archive/master.zip)
- Find it in your downloads directory and double click to unzip it – it will create a directory called `plugins-master`
- Inside it that directory, there's a directory named `sublime-text`, and inside it a file named `SublimeStepsize.py`
  - Find your Sublime packages directory – by default, it's `~/Library/Application \Support/Sublime\ Text 2/Packages` (or `Sublime\ Text 3`)
  - Create a new directory called `Stepsize` inside `Packages`, and inside that new directory paste the `SublimeStepsize.py` file
- Restart Sublime Text

You're good to go!
