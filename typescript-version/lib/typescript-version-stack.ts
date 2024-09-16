import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';  // Importa el módulo IAM
import { CfnOutput, Tags } from 'aws-cdk-lib'; // Importa para los outputs y tags

export class TypescriptVersionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Parámetros del stack
    const instanceName = 'Reemplazar 2';
    const amiId = 'ami-0aa28dab1f2852040';
    const keyName = 'vockey';  // Asegúrate de que es la key correcta

    // Obtener el VPC por defecto
    const vpc = ec2.Vpc.fromLookup(this, 'DefaultVPC', {
      isDefault: true
    });

    // Crear el grupo de seguridad
    const securityGroup = new ec2.SecurityGroup(this, 'InstanceSecurityGroup', {
      vpc,
      description: 'Permitir trafico SSH y HTTP',
      allowAllOutbound: true
    });

    // Reglas del grupo de seguridad
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Permitir SSH');
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Permitir HTTP');

    // Script de datos de usuario que se ejecuta al iniciar la instancia
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'cd /var/www/html/',
      'git clone https://github.com/utec-cc-2024-2-test/websimple.git',
      'git clone https://github.com/utec-cc-2024-2-test/webplantilla.git',
      'ls -l'
    );

    // Usar el rol LabRole en lugar de crear un nuevo rol
    const labRole = iam.Role.fromRoleArn(this, 'LabRole', 'arn:aws:iam::396103009317:role/LabRole');

    // Crear la instancia EC2 usando el rol existente LabRole
    const instance = new ec2.Instance(this, 'EC2Instance', {
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: ec2.MachineImage.genericLinux({
        'us-east-1': amiId,
      }),
      vpc,
      keyName,
      securityGroup,
      role: labRole, // Aquí especificas el rol LabRole
      blockDevices: [{
        deviceName: '/dev/sda1',
        volume: ec2.BlockDeviceVolume.ebs(20)  // 20 GB EBS
      }],
      userData: userData
    });

    // Añadir un tag a la instancia
    Tags.of(instance).add('Name', instanceName);

    // Outputs
    new CfnOutput(this, 'InstanceId', {
      value: instance.instanceId,
      description: 'ID de la instancia EC2'
    });

    new CfnOutput(this, 'InstancePublicIP', {
      value: instance.instancePublicIp,
      description: 'IP pública de la instancia'
    });

    new CfnOutput(this, 'websimpleURL', {
      value: `http://${instance.instancePublicIp}/websimple`,
      description: 'URL de websimple'
    });

    new CfnOutput(this, 'webplantillaURL', {
      value: `http://${instance.instancePublicIp}/webplantilla`,
      description: 'URL de webplantilla'
    });
  }
}
