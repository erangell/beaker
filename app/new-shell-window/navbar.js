/* globals customElements */
import {LitElement, html, css} from '../vendor/lit-element/lit-element'
import {classMap} from '../vendor/lit-element/lit-html/directives/class-map'
import _get from 'lodash.get'
import * as bg from './bg-process-rpc'
import buttonResetCSS from './navbar/button-reset.css'
import './navbar/location'
import './navbar/inpage-find'

class ShellWindowNavbar extends LitElement {
  static get properties () {
    return {
      activeTabIndex: {type: Number},
      activeTab: {type: Object},
      isUpdateAvailable: {type: Boolean, attribute: 'is-update-available'},
      numWatchlistNotifications: {type: Number, attribute: 'num-watchlist-notifications'},
      isBrowserMenuOpen: {type: Boolean}
    }
  }

  constructor () {
    super()
    this.activeTabIndex = -1
    this.activeTab = null
    this.isUpdateAvailable = false
    this.numWatchlistNotifications = 0
    this.isBrowserMenuOpen = false
  }

  get canGoBack () {
    return _get(this, 'activeTab.canGoBack')
  }

  get canGoForward () {
    return _get(this, 'activeTab.canGoForward')
  }

  get isLoading () {
    return _get(this, 'activeTab.isLoading')
  }

  focusLocation () {
    this.shadowRoot.querySelector('shell-window-navbar-location').focusLocation()
  }

  // rendering
  // =

  render () {
    return html`
      <link rel="stylesheet" href="beaker://assets/font-awesome.css">
      <div class="buttons" style="padding-left: 6px;">
        ${this.backBtn}
        ${this.forwardBtn}
        ${this.reloadBtn}
      </div>
      <shell-window-navbar-location
        .activeTabIndex="${this.activeTabIndex}"
        url="${_get(this, 'activeTab.url', '')}"
        title="${_get(this, 'activeTab.title', '')}"
        peers="${_get(this, 'activeTab.peers', 0)}"
        zoom="${_get(this, 'activeTab.zoom', '')}"
        .loadError=${_get(this, 'activeTab.loadError', null)}
        donate-link-href="${_get(this, 'activeTab.donateLinkHref') || ''}"
        local-path="${_get(this, 'activeTab.localPath') || ''}"
        available-alternative="${_get(this, 'activeTab.availableAlternative') || ''}"
        ?is-live-reloading=${_get(this, 'activeTab.isLiveReloading')}
        ?is-bookmarked=${_get(this, 'activeTab.isBookmarked', false)}
      ></shell-window-navbar-location>
      <shell-window-navbar-inpage-find
        .activeTabIndex="${this.activeTabIndex}"
        ?is-active=${_get(this, 'activeTab.isInpageFindActive', false)}
        query="${_get(this, 'activeTab.currentInpageFindString', '')}"
        active-match="${_get(this, 'activeTab.currentInpageFindResults.activeMatchOrdinal', '0')}"
        num-matches="${_get(this, 'activeTab.currentInpageFindResults.matches', '0')}"
      ></shell-window-navbar-inpage-find>
      <div class="buttons">
        ${this.watchlistBtn}
        ${this.browserMenuBtn}
      </div>
    `
  }

  get backBtn () {
    return html`
      <button class="nav-arrow-btn" ?disabled=${!this.canGoBack} @click=${this.onClickGoBack}>
        <svg
          class="icon nav-arrow"
          width="9" height="16"
          viewBox="0 0 9 16"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          style="position: relative; left: -2px;"
        >
          <g fill="none" stroke-linejoin="round">
            <polyline stroke-width="2" transform="translate(4.500000, 8.000000) scale(1, 1) translate(-4.500000, -8.000000) " points="8 1 1 8 8 15"/>
          </g>
        </svg>
      </button>
    `
  }

  get forwardBtn () {
    return html`
      <button class="nav-arrow-btn" ?disabled=${!this.canGoForward} @click=${this.onClickGoForward}>
        <svg
          class="icon nav-arrow"
          width="9" height="16"
          viewBox="0 0 9 16"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <g fill="none" stroke-linejoin="round">
            <polyline stroke-width="2" transform="translate(4.500000, 8.000000) scale(-1, 1) translate(-4.500000, -8.000000) " points="8 1 1 8 8 15"/>
          </g>
        </svg>
      </button>
    `
  }

  get reloadBtn () {
    if (this.isLoading) {
      return html`
        <button @click=${this.onClickStop}>
          <svg
            class="icon close"
            width="12"
            height="12"
            viewBox="0 0 58 58"
            xmlns:xlink="http://www.w3.org/1999/xlink"
          >
            <g id="svg-close" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
              <g transform="translate(4, 5)" stroke-width="10">
                <path d="M1.5,0.5 L48.5,47.5"/>
                <path d="M48.5,0 L1,48"/>
              </g>
            </g>
          </svg>
        </button>
      `
    }
    return html`
      <button @click=${this.onClickReload}>
        <svg
          class="icon refresh"
          width="16"
          height="15"
          viewBox="0 0 16 15"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <g transform="translate(1.000000, 1.000000)" fill="none">
            <path d="M10.9451459,1.75753722 C9.78269142,0.66752209 8.21929978,0 6.5,0 C2.91014913,0 0,2.91014913 0,6.5 C0,10.0898509 2.91014913,13 6.5,13 C9.00186057,13 11.173586,11.5865234 12.2601674,9.51457898" stroke-linecap="round"/>
            <polygon fill="#666666" points="14.2374369 4.98743687 9.64124279 4.63388348 13.8838835 0.391242789"/>
          </g>
        </svg>
      </button>
    `
  }

  get watchlistBtn () {
    if (!this.numWatchlistNotifications) {
      return html``
    }
    return html`
      <button class="watchlist-btn" @click=${this.onClickWatchlistBtn}>
        <span class="fas fa-eye"></span>
        <span class="badge">${this.numWatchlistNotifications}</span>
      </button>
    `
  }

  get browserMenuBtn () {
    const cls = classMap({pressed: this.isBrowserMenuOpen})
    return html`
      <button class=${cls} @click=${this.onClickBrowserMenu}>
        ${this.isUpdateAvailable
          ? html`<span class="fas fa-arrow-alt-circle-up"></span>`
          : html`<span class="fa fa-bars"></span>`}
      </button>
    `
  }

  // events
  // =

  onClickGoBack (e) {
    bg.views.goBack(this.activeTabIndex)
  }

  onClickGoForward (e) {
    bg.views.goForward(this.activeTabIndex)
  }

  onClickStop (e) {
    bg.views.stop(this.activeTabIndex)
  }

  onClickReload (e) {
    bg.views.reload(this.activeTabIndex)
  }

  onClickWatchlistBtn (e) {
    this.numWatchlistNotifications = 0
    bg.views.createTab('beaker://watchlist', {setActive: true})
  }

  async onClickBrowserMenu (e) {
    this.isBrowserMenuOpen = true
    await bg.views.toggleMenu('browser')
    this.isBrowserMenuOpen = false
  }
}
ShellWindowNavbar.styles = css`
:host {
  display: flex;
  background: var(--bg-foreground);
  height: 28px;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-border);
}

${buttonResetCSS}

button {
  width: 30px;
}

button.nav-arrow-btn {
  width: 28px;
}

button .fa {
  font-size: 16px;
}

svg.icon * {
  stroke: #666;
}

svg.icon.refresh {
  stroke-width: 1.75;
}

.buttons {
  display: flex;
  padding: 0 8px;
}

.fa-arrow-alt-circle-up {
  font-size: 20px;
  color: #67bf6b;
  -webkit-text-stroke: 1px #0eab0e;
}

.watchlist-btn {
  position: relative;
}

.watchlist-btn .fas {
  font-size: 16px;
}

.watchlist-btn .badge {
  position: absolute;
  right: 0px;
  top: 2px;
  font-size: 8px;
  border-radius: 50%;
  width: 12px;
  height: 12px;
  line-height: 12px;
  background: #0090ff;
  color: #fff;
  font-weight: 600;
}
`
customElements.define('shell-window-navbar', ShellWindowNavbar)
