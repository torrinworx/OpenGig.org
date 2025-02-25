// Create a gig and publish it.
import { OArray, OObject } from "destam-dom";
import { ODB } from "destam-web-core";

export default async () => {
    let gigs = await ODB('mongodb', 'gigs', { name: 'gigs' });

    if (!gigs) {
        gigs = await ODB('mongodb', 'gigs', {}, OObject({ name: 'gigs', list: OArray([]) }));
    }

    return {
        init: (something) => {
            console.log(something);
            console.log("THIS IS GIGS: ", gigs);

            return gigs
        }
    }
};
