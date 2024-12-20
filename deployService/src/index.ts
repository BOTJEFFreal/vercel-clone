import {createClient, commandOptions} from "redis";
import { copyFinalDist, downloadS3Folder } from "./utils/aws";
import { buildProject } from "./utils/buildProject";
const subscriber = createClient();
subscriber.connect();


async function main() {
    while(1) {
        const res = await subscriber.brPop(
            commandOptions({ isolated: true }),
            'build-queue',
            0
          );
          if(res !== null){
            console.log(res.element);
          } 

        const id = String(res?.element)

        await downloadS3Folder(`output/${id}`);
        await buildProject(id);
        await copyFinalDist(id);
			
    }
}
main();