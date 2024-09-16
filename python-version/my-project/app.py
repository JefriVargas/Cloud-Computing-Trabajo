#!/usr/bin/env python3
import os

import aws_cdk as cdk
from my_project.my_project_stack import MyProjectStack

app = cdk.App()

# Especificar la cuenta y región
MyProjectStack(app, "MyProjectStack",
    env=cdk.Environment(account="396103009317", region="us-east-1")  # Aquí defines la cuenta y la región
)

app.synth()
