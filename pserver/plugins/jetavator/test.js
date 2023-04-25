var plugin = require("./jetavator_service.js").create_plugin({});

function sleep(waitSec) {
    return new Promise(function (resolve) {
        setTimeout(function () { resolve() }, waitSec);
    });
}

async function start() {
    await sleep(3000);

    {
        console.log('boom_up');
        plugin.command_handler("boom 50");
        await sleep(3000);

        console.log('boom_down');
        plugin.command_handler("boom -50");
        await sleep(3000);

        plugin.command_handler("boom 0");
    }

    {
        console.log('arm_up');
        plugin.command_handler("arm 50");
        await sleep(3000);

        console.log('arm_down');
        plugin.command_handler("arm -50");
        await sleep(3000);

        plugin.command_handler("arm 0");
    }

    {
        console.log('yaw_cw');
        plugin.command_handler("yaw 50");
        await sleep(3000);

        console.log('yaw_ccw');
        plugin.command_handler("yaw -50");
        await sleep(3000);

        plugin.command_handler("yaw 0");
    }

    {
        console.log('bucket_up');
        plugin.command_handler("bucket 50");
        await sleep(3000);

        console.log('bucket_down');
        plugin.command_handler("bucket -50");
        await sleep(3000);

        plugin.command_handler("bucket 0");
    }

    plugin.command_handler("reset");
};
start();