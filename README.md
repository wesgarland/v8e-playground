# How to use the dcp-evaluator-v8 playground
- clone this repo
- change into the new directory
- install WebGPU deps if you want WebGPU support<blockquote>
sudo apt install vulkan-tools
</blockquote>
- install the dcp-worker package <blockquote>
wget --quiet -O - https://apt.distributive.network/gpg-pubkey.asc | sudo tee /etc/apt/keyrings/distributive-pubkey.asc
echo "deb [signed-by=/etc/apt/keyrings/distributive-pubkey.asc arch=$( dpkg --print-architecture )] https://apt.distributive.network $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/distributive.list
sudo apt update
sudo apt install dcp-worker
</blockquote>
- make it possible for your user to run the evaluator<blockquote>
chmod 775 /opt/dcp
</blockquote>
- ./smoke.v8e<pre
[~/v8e-playground] wes:wes# ./smoke.v8e
Running "dcp-evaluator", version 6.1.3+96d5118.uncommitted...
Evaluating (press Ctrl+C to quit)...
v8e runtime is working properly.
[~/v8e-playground] wes:wes# 
</pre>
- Files ending in .v8e are executable programs for Linux
- The node module node-v8e makes nodejs fake a the evaluator; load with -r
- Now look around the playground!
