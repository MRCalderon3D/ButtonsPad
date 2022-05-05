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

    public static escapeCode = ""
    public static holderMain: MRE.Actor;
    public static headerTextActor: MRE.Actor;
    public static headerText = "123";
	protected static assets: MRE.Actor;
    
    constructor(buttonsDatabase: { [key: string]: ButtonDescriptor }) {
        ButtonManager.assets = MRE.Actor.Create(App.Context);
		let x = 0;
    
		for (const button of Object.values(buttonsDatabase)) {
			this.CreateButtonInMenu(button);
		}
	}
    
	protected CreateButtonInMenu(buttonRecord: ButtonDescriptor): void {

        if(ButtonManager.holderMain === null || typeof ButtonManager.holderMain === 'undefined')
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
				parentId: ButtonManager.assets.id,
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
                // collider: { geometry: { shape: MRE.ColliderType.Auto} },
			},
		});

		let model: MRE.Actor;
        if(buttonRecord.pressValue !==ButtonsPad.boxContainer.toString() )
        {
            model = MRE.Actor.CreateFromLibrary(App.Context, {
                resourceId: buttonRecord.resourceId,
                actor: {
                    parentId: holder.id,
                },
            });
        }
        else
        {
            model = MRE.Actor.CreateFromLibrary(App.Context, {
                resourceId: buttonRecord.resourceId,
                actor: {
                    parentId: holder.id,
                    // collider: { geometry: { shape: MRE.ColliderType.Box, size: { x: 0.1, y: 0.1, z: 0.1 }},
                    // layer: MRE.CollisionLayer.Navigation },
                    
                },
            });
        }

        if(buttonRecord.pressValue !==ButtonsPad.boxContainer.toString() )
            Utilities.CreateHoverButton(model).onClick((user) =>
                ButtonManager.ButtonPressed(buttonRecord, user)
		);

		// const myCurve: EaseCurve = [0.17,0.67,0.59,1.28]
		// Utilities.ScaleAnimation(model, new MRE.Vector3(1, 1, 1), 0.5, myCurve);
	}

	public static ButtonPressed(buttonRecord: ButtonDescriptor, user: MRE.User) {

        const valueButton: ButtonsPad = +buttonRecord.pressValue as ButtonsPad;

        switch (valueButton) {
            case ButtonsPad.buttonOk:
                if(ButtonManager.escapeCode === ButtonManager.headerText)
                {
                    ButtonManager.WriteText("RIGHT!", new MRE.Color3(0,0,255));

                    (async () => { 
                        Utilities.RotateAnimation(ButtonManager.assets, new MRE.Quaternion(0, -0.90, 0, 1), 1.5);
                
                        await new Promise(f => setTimeout(f, 5000));
                        //await delay(1000);
                        // Do something after
                        Utilities.RotateAnimation(ButtonManager.assets, new MRE.Quaternion(0, 0, 0, 1), 10.5);
                    })();
                }
                else
                    ButtonManager.WriteText("FAIL!", new MRE.Color3(255,0,0));
                break;
            case ButtonsPad.buttonDelete:
                ButtonManager.WriteText("", new MRE.Color3(255,0,0));
                break;
            case ButtonsPad.boxContainer:
                break;
            default:
                ButtonManager.WriteText(valueButton.toString(),new MRE.Color3(0,255,0), true);
                break;
            }
	}

    public static WriteText(text: string, color: MRE.Color3Like, append = false) {
        if(append)
        {
            if(ButtonManager.headerText.length >= 3)
            {
                ButtonManager.headerText = "";
            }
            ButtonManager.headerText += text;
        }
        else
        ButtonManager.headerText = text;

        if(ButtonManager.headerTextActor === null || typeof ButtonManager.headerTextActor === 'undefined')
        {
            ButtonManager.CreateHeaderText(color);
        }
        else{
            ButtonManager.headerTextActor.text.contents = ButtonManager.headerText;
            ButtonManager.headerTextActor.text.color = color;
        }
        
    }

    private static CreateHeaderText(color: MRE.Color3Like) {
        ButtonManager.headerTextActor = MRE.Actor.Create(App.Context, {
            actor: {
                parentId: ButtonManager.assets.id,
                transform: {
                    local: {
                        position: { x: 1.2, y: 2.15, z: -0.4 },
                        scale: { x: 0.5, y: 0.5, z: 0.5 },
                    },
                },
                text: {
                    contents: ButtonManager.headerText,
                    anchor: MRE.TextAnchorLocation.MiddleRight,
                    color: color,
                    height: 0.3
                },
            },
        });
    }
}

/*
"button01": {
    "menuScale": {
      "x": 0.5,
      "y": 0.5,
      "z": 0.5
    },
    "pressValue": "1",
    "resourceId": "artifact:1978323176999879096",
    "menuPosition": {
      "x": -0.285,
      "y": 0.285,
      "z": -0.35
    },
    "menuRotation": {
      "x": 90,
      "y": 180,
      "z": 0
    }
  },*/