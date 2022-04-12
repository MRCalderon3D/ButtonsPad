import * as MRE from "@microsoft/mixed-reality-extension-sdk";

import fetch from "node-fetch";

import { ButtonManager} from "./Code";

/**
 * The main class of this app. All the logic goes here.
 */
export default class App {

	public static Context: MRE.Context;

	private header = "Bravent Designs";
	private color: MRE.Color3Like = { r: 218 / 255, g: 221 / 255, b: 2 / 255 };

	private buttonList: ButtonManager;

	constructor(private context: MRE.Context, private params: MRE.ParameterSet) {

		App.Context = context;

		this.context.onStarted(() => {
			// Get items and update
			if (this.params.content_pack) {
				this.GetContentPackJson(this.params.content_pack as string, (json: any) => {
					this.buttonList = new ButtonManager(json);
				});
			} else { console.log("ERROR: No content path selected!"); }
		});
	}

	private GetContentPackJson(id: string, callback: (json: any) => void) {
		fetch("https://account.altvr.com/api/content_packs/" +
			id +
			"/raw.json")
			.then((res: any) => res.json())
			.then((json: any) => callback(json));
	}
}
