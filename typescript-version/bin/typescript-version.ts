#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TypescriptVersionStack } from '../lib/typescript-version-stack';

const app = new cdk.App();

// Especificar la cuenta y región
new TypescriptVersionStack(app, 'TypescriptVersionStack', {
  env: { account: '396103009317', region: 'us-east-1' }  // Define la cuenta y región
});

app.synth();
