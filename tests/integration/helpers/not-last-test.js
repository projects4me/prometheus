import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Helper | not-last', function() {
    setupComponentTest('not-last', {
        integration: true
    });

    let scenarios = [
        [
            {
                "section1": {
                    "list": {
                        "label": "view.nav.menu.timelog.list",
                        "route": "app.module",
                        "className": "text-teal",
                        "anchorRoute": "timelog",
                        "projectRelated": false,
                        "routeParams": {
                            "module": "timelog"
                        }
                    },
                    "create": {
                        "label": "view.nav.menu.timelog.create",
                        "route": "app.create",
                        "className": "text-red",
                        "anchorRoute": "timelog/create",
                        "projectRelated": false,
                        "routeParams": {
                            "module": "timelog"
                        }
                    }
                },
                "section2": {
                    "import": {
                        "label": "view.nav.menu.timelog.import",
                        "route": "app.import",
                        "anchorRoute": "timelog/import",
                        "projectRelated": false,
                        "routeParams": {
                            "module": "timelog"
                        }
                    },
                    "export": {
                        "label": "view.nav.menu.timelog.export",
                        "route": "app.export",
                        "anchorRoute": "timelog/export",
                        "projectRelated": false,
                        "routeParams": {
                            "module": "timelog"
                        }
                    }
                }
            },
            {
                "list": {
                    "label": "view.nav.menu.timelog.list",
                    "route": "app.module",
                    "className": "text-teal",
                    "anchorRoute": "timelog",
                    "projectRelated": false,
                    "routeParams": {
                        "module": "timelog"
                    }
                },
                "create": {
                    "label": "view.nav.menu.timelog.create",
                    "route": "app.create",
                    "className": "text-red",
                    "anchorRoute": "timelog/create",
                    "projectRelated": false,
                    "routeParams": {
                        "module": "timelog"
                    }
                }
            },
            'true'
        ],
        [
            {
                "section1": {
                    "list": {
                        "label": "view.nav.menu.report.list",
                        "route": "app.module",
                        "className": "text-teal",
                        "anchorRoute": "report",
                        "projectRelated": false,
                        "routeParams": {
                            "module": "report"
                        }
                    },
                    "create": {
                        "label": "view.nav.menu.report.create",
                        "route": "app.create",
                        "className": "text-red",
                        "anchorRoute": "report/create",
                        "projectRelated": false,
                        "routeParams": {
                            "module": "report"
                        }
                    }
                },
                "section2": {
                    "export": {
                        "label": "view.nav.menu.report.export",
                        "route": "app.export",
                        "anchorRoute": "report/export",
                        "projectRelated": false,
                        "routeParams": {
                            "module": "report"
                        }
                    }
                }
            },
            {
                "export": {
                    "label": "view.nav.menu.report.export",
                    "route": "app.export",
                    "anchorRoute": "report/export",
                    "projectRelated": false,
                    "routeParams": {
                        "module": "report"
                    }
                }
            },
            'false'
        ]
    ];

    scenarios.forEach(function (scenario) {
        it('matches '+scenario[0], function() {
            this.set('a', scenario[0]);
            this.set('b', scenario[1]);
            this.render(hbs`{{not-last a b}}`);
            expect(this.$().text().trim()).to.equal(scenario[2]);
        });
    });

});