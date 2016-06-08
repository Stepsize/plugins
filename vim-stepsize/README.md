## Installing the Stepsize Layer plugin for Vim

#### The right way – terminal command

`wget https://github.com/Stepsize/plugins/archive/master.zip && unzip master.zip && pushd plugins-master/vim-stepsize && make && popd && rm -rf master.zip plugins-master`

Restart Vim after running this command and you're good to go!

#### The manual way – clicking, dragging & dropping

- Download the Stepsize Layer plugin zip file [here](https://github.com/Stepsize/plugins/archive/master.zip)
- Find it in your downloads directory and double click to unzip it – it will create a directory called `plugins-master`
- Inside it that directory, there's a directory named `vim-stepsize`, and inside it a file named `stepsize.vim`
  - Find your Vim plugin directory – by default, it's `~/.vim/plugin`
  - Create a new directory called `Stepsize` inside the plugin folder, and inside that new directory paste the `stepsize.vim` file
- Restart Vim

You're good to go!
