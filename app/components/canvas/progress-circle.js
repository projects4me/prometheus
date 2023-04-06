/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * This component is used to render progress circle.
 *
 * @class CanvasProgressCircleComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class CanvasProgressCircleComponent extends Component {

    /**
     * This function is called when a component is rendered or arguments to
     * that component is updated, in order to calculate the progress value of 
     * circle in percentage.
     *
     * @method setCircleProgress
     * @public
     */
    @action setCircleProgress() {
        let selector = `canvas[data-progress-of="${this.args.moduleName}"]`;
        const canvas = document.querySelector(selector);
        const context = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 50;

        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.strokeStyle = '#A2EDD2';
        context.lineWidth = 10;
        context.stroke();

        context.beginPath();
        let arcValue = this.getArcValue();
        context.arc(centerX, centerY, radius, 1.5 * Math.PI, arcValue, false);
        context.lineWidth = 10;
        context.strokeStyle = '#508874';
        context.stroke();

        context.font = "2.5rem Source Sans Pro, sans-serif";
        let text = `${this.args.completionPercentage}%`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "#000000";
        context.fillText(text, centerX + 5, centerY);
    }

    /**
     * This function calculate and return the arc value of circle
     * depending upon the completion percentage.
     *
     * @method getArcValue
     * @public
     */
    getArcValue() {
        let valInDegree = this.args.completionPercentage * 3.6;
        return (Math.PI / 180) * (270 + valInDegree);
    }
}
