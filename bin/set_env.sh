#creates .env file specific to environment in root folder
#and sets the environment variables in ElasticBeanstalk server through eb-cli
VARS="$(< $1.env)"
concat=""
rm -f ../.env
touch ../.env
for VAR in $VARS; do
	concat+="$VAR "
	printf "$VAR\n" >> ../.env
done
if [ $1 != "local" ]
then
	eb setenv $concat -e $1
fi

