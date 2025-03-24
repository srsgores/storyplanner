import Component from "@glimmer/component";
import {inject as service} from "@ember/service";

/**
 * SyncStatus component displays connection state, authentication status,
 * and sync controls from the data-sync service.
 */
export default class SyncStatusComponent extends Component {
	@service session;
	@service dataSync;
}
