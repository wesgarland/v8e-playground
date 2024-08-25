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

- ./smoke.v8e
```
$ ./smoke.v8e
Running "dcp-evaluator", version 6.1.3+96d5118.uncommitted...
Evaluating (press Ctrl+C to quit)...
v8e runtime is working properly. 
$
```

- $ ./webgpu-smoke-test.v8e
```
Running "dcp-evaluator", version 6.1.3+96d5118.uncommitted...
Warning: terminator_CreateInstance: Failed to CreateInstance in ICD 1.  Skipping ICD.
WebGPU: obtained device
Evaluating (press Ctrl+C to quit)...
Your evaluator has WebGPU support
Your GPU Adapter supports the following features:
 . bgra8unorm-storage
 . rg11b10ufloat-renderable
 . indirect-first-instance
 . depth32float-stencil8
 . depth-clip-control
 . texture-compression-bc
Your GPU Adapter has the following limits:
```

- Files ending in .v8e are executable programs for Linux
- The node module node-v8e makes nodejs fake the evaluator; load with -r - useful for debugging
- Now look around the playground!
