import { InlineProgramArgs, LocalWorkspace, LocalWorkspaceOptions, ProjectSettings, PulumiFn } from "@pulumi/pulumi/automation";
import 'dotenv/config';
import { ARGUMENTS, PREFIX, PROJECT_WORKFLOW, PULUMI_STACK_CONFIG, URLS } from "./interfaces/enumerated";
import { ProgramAPI } from "./providers/aws/api";
import { ProgramWEB } from "./providers/aws/web";

const process = require('process');
const args = process.argv.slice(2);

let isApi = false;
let isWeb = false;
let isDestroy = false;
let isUp = false;
if (!(args[0] && args[1])){
    console.info("required arguments missing");
    process.exit(0);
} else {
    isApi = (args[0] === ARGUMENTS.API) && (args[0] === process.env.PROJECT_SERVICE_NAME);
    isWeb = (args[0] === ARGUMENTS.WEB) && (args[0] === process.env.PROJECT_SERVICE_NAME);
    isDestroy = args[1] === ARGUMENTS.DESTROY;
    isUp = args[1] === ARGUMENTS.UP;
}

const run = async () => {
    let pulumiProgram: PulumiFn;
    if(isApi){
        pulumiProgram = ProgramAPI;
    } else if(isWeb){
        pulumiProgram = ProgramWEB;
    }

    // Create our stack 
    const args: InlineProgramArgs = {
        stackName: PREFIX.PULUMI_STACK,
        projectName: process.env.PROJECT_NAME,
        program: pulumiProgram
    };

    // create (or select if one already exists) a stack that uses our inline program
    const projectSettings: ProjectSettings = {
        name: process.env.PROJECT_NAME,
        runtime: "nodejs",
        description: `Pulumi stack for the ${PREFIX.PROJECT} project`,
        website: URLS.WEBSITE,
    };
    const localWorkspaceOptions: LocalWorkspaceOptions = {
        projectSettings: projectSettings
    };
    const stack = await LocalWorkspace.createOrSelectStack(args, localWorkspaceOptions);
    console.info("successfully initialized stack");
    
    console.info("installing plugins...");
    await stack.workspace.installPlugin("aws", "v4.0.0");
    console.info("plugins installed");

    console.info("setting up config");
    await stack.setConfig(PULUMI_STACK_CONFIG.AWS_REGION, { value: process.env.AWS_REGION });
    if(isApi){
        await stack.setConfig(PULUMI_STACK_CONFIG.MONGODB_ATLAS_PUBLIC_KEY, { value: process.env.MONGODB_ATLAS_PUBLIC_KEY, secret: true });
        await stack.setConfig(PULUMI_STACK_CONFIG.MONGODB_ATLAS_PRIVATE_KEY, { value: process.env.MONGODB_ATLAS_PRIVATE_KEY, secret: true });
        await stack.setConfig(PULUMI_STACK_CONFIG.CLOUDFLARE_API_TOKEN, { value: process.env.CLOUDFLARE_API_TOKEN, secret: true });
    }
    console.info("config set");
    
    console.info("refreshing stack...");
    await stack.refresh({ onOutput: console.info });
    console.info("refresh complete");
    
    // 💣💣💣 prevent the production stack from being destroyed 💣💣💣
    if (isDestroy && process.env.PROJECT_WORKFLOW !== PROJECT_WORKFLOW.PRODUCTION) {
        console.info("destroying stack...");
        await stack.destroy({ onOutput: console.info });
        console.info("stack destroy complete");
        process.exit(0);
    }

    // TODO: add a check to see if the stack is up and running
    // const previewRes = await stack.preview({ onOutput: console.info });
    // console.dir("previewRes.stdout ::: ", previewRes.stdout);
    if (isUp){
        console.info("updating stack...");
        const upRes = await stack.up({ onOutput: console.info });
        console.log(`update summary: \n${JSON.stringify(upRes.summary.resourceChanges, null, 4)}`);
        console.log(`🔥🔥🔥 website url: ${URLS.WEBSITE}`);
    }
};

if((isApi||isWeb) && (isDestroy||isUp)){
    run().catch(err => console.log(err));
} else {
    console.info("at least one of the arguments is invalid");
    process.exit(0);
}
