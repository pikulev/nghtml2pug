#!/usr/bin/env node

const getStdin = require('get-stdin');
const { argv } = require('yargs');
const nghtml2pug = require('./');
const { version } = require('../package.json');

/**
 * Create a help page
 */
const help = [
  '\n  Usage: html2pug [options] < [file]\n',
  '  Options:\n',
  '    -t, --tabs              Use tabs instead of spaces',
  '    -h, --help              Show this page',
  '    -v, --version           Show version\n',
  '  Examples:\n',
  '    # Accept input from file and write to stdout',
  '    $ html2pug < example.html\n',
  '    # Or write to a file',
  '    $ html2pug < example.html > example.pug \n',
].join('\n');

/**
 * Convert HTML from stdin to Pug
 */
async function main({ needsHelp, showVersion, useTabs }) {
  /* eslint-disable no-console */
  const stdin = null; // await getStdin();

  if (showVersion) {
    return console.log(version);
  }

  if (needsHelp || !stdin) {
    // return console.log(help);
  }

  const test = `
  <form [formGroup]="tableForm" class="pt-0" *ngIf="currentParams$ | async as params">
  <div class="clr-row clr-align-items-baseline clr-justify-content-between">
    <div class="clr-col-auto">
      <div class="clr-row clr-align-items-baseline">
        <h3 class="clr-col-auto mt-0">
          <ng-container *ngIf="params.dateRange.from !== params.dateRange.to">
            {{ params.dateRange.from | date:'longDate' }} &mdash; {{ params.dateRange.to | date:'longDate' }}
          </ng-container>
          <ng-container *ngIf="params.dateRange.from === params.dateRange.to">
            {{ params.dateRange.from | date:'longDate' }}
          </ng-container>
        </h3>
        <div class="clr-col-auto">
          <div *ngIf="isTableReloading; then loading"></div>
        </div>
      </div>
    </div>
    <div class="clr-col-auto btn-group btn-link daterange-selector">
      <div class="radio btn" [class.disabled]="tableForm.controls['dateRangeAlias'].disabled">
        <input type="radio" value="today" formControlName="dateRangeAlias" id="btn-today">
        <label for="btn-today">Today</label>
      </div>
      <div class="radio btn" [class.disabled]="tableForm.controls['dateRangeAlias'].disabled">
        <input type="radio" value="yesterday" formControlName="dateRangeAlias" id="btn-yesterday">
        <label for="btn-yesterday">Yesterday</label>
      </div>
      <div class="radio btn" [class.disabled]="tableForm.controls['dateRangeAlias'].disabled">
        <input type="radio" value="thisWeek" formControlName="dateRangeAlias" id="btn-thisweek">
        <label for="btn-thisweek">This Week</label>
      </div>
      <div class="radio btn" [class.disabled]="tableForm.controls['dateRangeAlias'].disabled">
        <input type="radio" value="last7days" formControlName="dateRangeAlias" id="btn-7days">
        <label for="btn-7days">7 Days</label>
      </div>
      <div class="radio btn" [class.disabled]="tableForm.controls['dateRangeAlias'].disabled">
        <input type="radio" value="custom" formControlName="dateRangeAlias" id="btn-custom">
        <label for="btn-custom" (click)="openCustomDateRangeModal()">
          Custom
        </label>
      </div>
    </div>
  </div>

  <ng-container *ngIf="filtersList?.length">
    <div class="clr-row mt-05" style="margin-left: -.75rem;" [class.app-disabled]="isTableReloading">
      <div class="clr-col-12" *ngIf="filtersList as filters">
        <span class="label filter-label" *ngFor="let filter of filters">
          {{ filter?.title }}
          <clr-icon shape="times" role="button" (click)="disableFilter(filter?.type)"></clr-icon>
        </span>
      </div>
    </div>
  </ng-container>

  <ng-container *ngIf="lineChartData$ | async as lineData; else loadingChart">
    <ng-container *ngIf="lineChartOptions$ | async as lineOptions">
      <!-- todo: сделать нормальный маркер графика "однодневки" -->
      <div class="clr-row clr-justify-content-end mt-2" *ngIf="lineData.datasets[0].data.length > 1">
        <div class="clr-col-auto">
          <clr-select-container class="mt-0">
            <select clrSelect formControlName="chartMetricIndex" *ngIf="metricColumns$ | async as metrics">
              <option *ngFor="let metric of metrics" [ngValue]="metric.index">{{ metric.header }}</option>
            </select>
          </clr-select-container>
        </div>
        <div class="clr-col-12 mt-05">
          <canvas baseChart height="260" [datasets]="lineData.datasets" [labels]="lineData.labels" [legend]="false"
            [chartType]="'line'" [options]="lineOptions" [plugins]="[]" [class.app-disabled]="isTableReloading">
          </canvas>
        </div>
      </div>
    </ng-container>
  </ng-container>

  <ng-container *ngIf="isTableNotEmpty">
    <div class="clr-row clr-justify-content-end" *ngIf="breakdownsList$ | async as breakdownsList">
      <div class="clr-col-auto clr-form-control">
        <div class="btn-group" formArrayName="breakdowns">
          <div class="checkbox btn" *ngFor="let breakdown of breakdownsForm.controls; let i = index"
            [class.disabled]="isBreakdownDisabled(breakdownsList[i].key, params.filters)"
            (click)="breakdownClick$.next({$event: $event, index: i})">
            <input type="checkbox" [attr.id]="'btn-breakdown-check-' + i" [formControlName]="i">
            <label [for]="'btn-breakdown-check-' + i">{{breakdownsList[i].title}}</label>
          </div>
        </div>
      </div>
    </div>
  </ng-container>
</form>

<ng-container *ngIf="currentParams$ | async as params">
  <div class="clr-row" *ngIf="table$ | async as table">
    <div class="clr-col-12">
      <app-flat-table *ngIf="isTableNotEmpty; else empty" [table]="table" [currentSort]="params.sort"
        [displayedColumns]="displayedColumns" [disabled]="isTableReloading" (filterEvents)="applyFilter($event)"
        (sortEvents)="applySort($event, table.params.sort)">
      </app-flat-table>
    </div>
  </div>
</ng-container>

<ng-template #loading>
  <span class="spinner spinner-sm">
  </span>
</ng-template>
<ng-template #loadingChart>
  <div class="clr-row clr-justify-content-center">
    <div class="clt-col-auto" style="min-height: 260px;"></div>
  </div>
</ng-template>

<ng-template #empty>
  <ng-container *ngIf="!isTableReloading">
    There is no data yet&hellip;
  </ng-container>
</ng-template>

<clr-modal [(clrModalOpen)]="showCustomDateRangeForm" [clrModalSize]="'sm'" [clrModalClosable]="false">
  <h3 class="modal-title">Select date range</h3>
  <div class="modal-body">
    <p *ngIf="customDateRange.errors as errors" class="p7 app-text-error">
      <clr-icon shape="exclamation-circle"></clr-icon>
      <span *ngIf="errors.endDateError">
        <b>From</b> should be less than <b>To</b>
      </span>
    </p>
    <form clrForm [formGroup]="customDateRange" novalidate>
      <clr-date-container>
        <label for="fromDate">From</label>
        <input id="fromDate" type="date" clrDate formControlName="from" placeholder="YY-MM-DD" />
        <clr-control-error *clrIfError="'required'">Required</clr-control-error>
      </clr-date-container>
      <clr-date-container>
        <label for="toDate">To</label>
        <input id="toDate" type="date" clrDate formControlName="to" placeholder="YY-MM-DD" />
        <clr-control-error *clrIfError="'required'">Reqiured</clr-control-error>
      </clr-date-container>
    </form>
  </div>
  <div class="modal-footer">
    <button type="button" class="btn btn-link" (click)="cancelCustomDateRangeModal()">Cancel</button>
    <button type="button" class="btn btn-primary" (click)="customDateRangeSubmit$.next(true)"
      [disabled]="!customDateRange.valid">Submit</button>
  </div>
</clr-modal>
`;

  const pug = nghtml2pug(test, { useTabs });
  return console.log(pug);

  /* eslint-enable no-console */
}

/**
 * Get the CLI options and run program
 */
main({
  needsHelp: !!(argv.help || argv.h),
  showVersion: !!(argv.version || argv.v),
  useTabs: !!(argv.tabs || argv.t),
}).then(() => {
  process.exit(0);
});
