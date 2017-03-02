## Installing the Stepsize Layer plugin for Visual Studio Code

#### The right way – terminal command

`wget https://github.com/Stepsize/plugins/archive/master.zip && unzip master.zip && mv plugins-master/vscode ~/.vscode/extensions/stepsize-layer && rm -rf plugins-master master.zip`

Restart Visual Studio Code after running this command and you're good to go!

Note: if somehow your Visual Studio Code support directory is not located at `~/.vscode`, change the command to match your setup.

#### The manual way – clicking, dragging & dropping

- Download the Stepsize Layer plugin zip file [here](https://github.com/Stepsize/plugins/archive/master.zip)
- Find it in your downloads directory and double click to unzip it – it will create a directory called `plugins-master`
- Inside it that directory, there's a directory named `vscode`
  - Copy the `vscode` directory
  - Find your Visual Studio Code extensions directory – by default, it's in your home directory `~/.vscode/extensions`
  - Paste the `vscode` directory inside the vscode `extensions` directory (and you can rename it to `stepsize-layer` for clarity)
- Restart Visual Studio Code

You're good to go!
