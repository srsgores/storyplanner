import Component from "@glimmer/component";
import {inject as service} from "@ember/service";

export default class SyncStatusComponent extends Component {
	@service session;
	@service dataSync;
}
