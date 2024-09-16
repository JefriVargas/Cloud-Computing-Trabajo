from aws_cdk import (
    Stack,
    aws_ec2 as ec2,
    aws_iam as iam,
    CfnOutput,
    Tags,
)
from constructs import Construct

class MyProjectStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Parámetros del stack
        instance_name = "MV Reemplazar"
        ami_id = "ami-0aa28dab1f2852040"
        key_name = "vockey"

        # Obtener el VPC por defecto solo una vez
        vpc = ec2.Vpc.from_lookup(self, "DefaultVPC", is_default=True)

        # Crear el grupo de seguridad
        security_group = ec2.SecurityGroup(self, "InstanceSecurityGroup",
            vpc=vpc,
            description="Permitir trafico SSH y HTTP desde cualquier lugar",
            allow_all_outbound=True
        )

        # Reglas de entrada del grupo de seguridad
        security_group.add_ingress_rule(
            peer=ec2.Peer.any_ipv4(),
            connection=ec2.Port.tcp(22),
            description="Permitir SSH"
        )

        security_group.add_ingress_rule(
            peer=ec2.Peer.any_ipv4(),
            connection=ec2.Port.tcp(80),
            description="Permitir HTTP"
        )

        # Datos de usuario que se ejecutan al iniciar la instancia
        user_data = ec2.UserData.for_linux()
        user_data.add_commands(
            "cd /var/www/html/",
            "git clone https://github.com/utec-cc-2024-2-test/websimple.git",
            "git clone https://github.com/utec-cc-2024-2-test/webplantilla.git",
            "ls -l"
        )

        # Usar el rol LabRole en lugar de crear un nuevo rol
        lab_role = iam.Role.from_role_arn(self, "LabRole", "arn:aws:iam::396103009317:role/labrole")

        # Crear la instancia EC2 usando el rol existente LabRole
        instance = ec2.Instance(self, "EC2Instance",
            instance_type=ec2.InstanceType("t2.micro"),
            machine_image=ec2.MachineImage.generic_linux({
                "us-east-1": ami_id
            }),
            vpc=vpc,
            key_name=key_name,
            security_group=security_group,
            block_devices=[ec2.BlockDevice(
                device_name="/dev/sda1",
                volume=ec2.BlockDeviceVolume.ebs(20)
            )],
            role=lab_role,
            user_data=user_data
        )

        # Añadir un tag a la instancia
        Tags.of(instance).add("Name", instance_name)

        # Outputs
        CfnOutput(self, "InstanceId",
            description="ID de la instancia EC2",
            value=instance.instance_id
        )

        CfnOutput(self, "InstancePublicIP",
            description="IP publica de la instancia",
            value=instance.instance_public_ip
        )

        CfnOutput(self, "websimpleURL",
            description="URL de websimple",
            value=f"http://{instance.instance_public_ip}/websimple"
        )

        CfnOutput(self, "webplantillaURL",
            description="URL de webplantilla",
            value=f"http://{instance.instance_public_ip}/webplantilla"
        )

