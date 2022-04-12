import * as MRE from "@microsoft/mixed-reality-extension-sdk";
import { EaseCurve } from "@microsoft/mixed-reality-extension-sdk";
import App from "../app";
import { Utilities } from "./utilities";

export type ButtonDescriptor = {
	resourceId: string;
	pressValue: string;
	
	menuScale: {
		x: number; y: number; z: number;
	};
	menuRotation: {
		x: number; y: number; z: number;
	};
	menuPosition: {
		x: number; y: number; z: number;
	};
};

export enum ButtonsPad {
    button00 = 0,
    button01,
    button02,
    button03,
    button04,
    button05,
    button06,
    button07,
    button08,
    button09,
    buttonOk = 101,
    buttonDelete = 102,
    boxContainer = 103
}


export class ButtonManager {

	//protected static attachedCloth = new Map<MRE.Guid, MRE.Actor>();

    public static holderMain: MRE.Actor;
    public static headerTextActor: MRE.Actor;
    public static headerText: string;
	protected assets: MRE.Actor;
    
    constructor(buttonsDatabase: { [key: string]: ButtonDescriptor }) {
        this.assets = MRE.Actor.Create(App.Context);
		let x = 0;
    
		for (const button of Object.values(buttonsDatabase)) {
			this.CreateButtonInMenu(button);
		}
	}
    
	protected CreateButtonInMenu(buttonRecord: ButtonDescriptor): void {

        if(ButtonManager.holderMain === null)
            ButtonManager.holderMain = MRE.Actor.Create(App.Context);


		// special scaling and rotation for menu
		const rotation = buttonRecord.menuRotation
			? buttonRecord.menuRotation
			: { x: 0, y: 0, z: 0 };
		const scale = buttonRecord.menuScale
			? buttonRecord.menuScale
			: { x: 3, y: 3, z: 3 };
		const position = buttonRecord.menuPosition
			? buttonRecord.menuPosition
			: { x: 0, y: 1, z: 0 };

		// Create menu parent
		const holder = MRE.Actor.Create(App.Context, {
			actor: {
				parentId: this.assets.id,
				transform: {
					local: {
						position: { x: position.x, y: position.y, z: position.z },
						rotation: MRE.Quaternion.FromEulerAngles(
							rotation.x * MRE.DegreesToRadians,
							rotation.y * MRE.DegreesToRadians,
							rotation.z * MRE.DegreesToRadians
						),
						scale: scale,
					},
				},
			},
		});

		// Create a Artifact without a collider
		let model = MRE.Actor.CreateFromLibrary(App.Context, {
			resourceId: buttonRecord.resourceId,
			actor: {
				parentId: holder.id,
				// transform: {
				// 	local: {
				// 		scale: new MRE.Vector3(0, 0, 0),
				// 	},
				// },
			},
		});
		
		// Set a click handler on the button.
		// NOTE: button press event fails on MAC
        if(buttonRecord.pressValue !==ButtonsPad.boxContainer.toString() )
            Utilities.CreateHoverButton(model).onClick((user) =>
                ButtonManager.ButtonPressed(buttonRecord, user)
		);

		const myCurve: EaseCurve = [0.17,0.67,0.59,1.28]
		Utilities.ScaleAnimation(model, new MRE.Vector3(1, 1, 1), 0.5, myCurve);
	}

	public static ButtonPressed(buttonRecord: ButtonDescriptor, user: MRE.User) {

        const valueButton: ButtonsPad = +buttonRecord.pressValue as ButtonsPad;

        switch (valueButton) {
            case ButtonsPad.buttonOk:
                ButtonManager.WriteText("Congratulations", new MRE.Color3(0,0,255));
                break;
            case ButtonsPad.buttonDelete:
                ButtonManager.WriteText("FAIL!", new MRE.Color3(255,0,0));
                break;
            case ButtonsPad.boxContainer:
                break;
            default:
                ButtonManager.WriteText(valueButton.toString(),new MRE.Color3(0,255,0));
                break;
            }
	}

    public static WriteText(text: string, color: MRE.Color3Like, append = true) {
        if(append)
            ButtonManager.headerText += text;
        else
        ButtonManager.headerText = text;

        ButtonManager.headerTextActor.destroy();

        ButtonManager.headerTextActor = MRE.Actor.Create(App.Context, {
            actor: {
                parentId: ButtonManager.holderMain.id,
                transform: {
                    local: {
                        position: { x: 1, y: 1.5, z: 0 },
                        scale: { x: 1, y: 1, z: 1 },
                    },
                },
                text: {
                    contents: ButtonManager.headerText,
                    anchor: MRE.TextAnchorLocation.TopLeft,
                    color: color,
                    height: 0.3
                },
            },
        });
    }
}