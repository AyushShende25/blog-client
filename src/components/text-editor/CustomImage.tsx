import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ImageNodeView from "./ImageNodeView";

export const CustomImage = Image.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			mediaId: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-media-id"),

				renderHTML: (attributes) => {
					if (!attributes.mediaId) {
						return {};
					}

					return {
						"data-media-id": attributes.mediaId,
					};
				},
			},
			uploading: {
				default: false,
				parseHTML: (element) =>
					element.getAttribute("data-uploading") === "true",

				renderHTML: (attributes) => {
					if (!attributes.uploading) {
						return {};
					}

					return {
						"data-uploading": "true",
					};
				},
			},
		};
	},
	addNodeView() {
		return ReactNodeViewRenderer(ImageNodeView);
	},
});
