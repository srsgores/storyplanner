import Component from "@glimmer/component";
import {tracked} from "@glimmer/tracking";
import {guidFor} from "@ember/object/internals";
import {action} from "@ember/object";
import {debounce} from "@ember/runloop";
import {inject as service} from "@ember/service";

export default class AutocompleteComponent extends Component {
	elementId = guidFor(this);
	@tracked options = [];
	@tracked isLoading = false;
	@service store;

	updateMatchResults() {
		this.store.findAll(this.args.modelName).then((matches) => {
			this.options = matches.map((model) => {
				return {
					id: model.id,
					name: model.title || model.name
				};
			});
		}).finally(() => {
			this.isLoading = false;
		});
	}
	constructor() {
		super(...arguments);
		this.fetchMatches();
	}

	@action fetchMatches() {
		this.isLoading = true;
		debounce(this, "updateMatchResults", 500);
	}
}
