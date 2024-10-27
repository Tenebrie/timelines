if [[ -z "$VERSION" ]]; then
    echo "Must provide VERSION environment" 1>&2
    exit 1
fi

# Define color variables
SUCCESS_COLOR='\033[38;5;154;48;5;22m' # Light green on dark green background
ERROR_COLOR='\033[38;5;203;48;5;52m' # Light red on dark red background
RESET_COLOR='\033[0m'     # Reset to default

# Ensure log files are removed if the script exits prematurely
trap 'rm -f gatekeeper.log styx.log rhea.log calliope.log' EXIT

# Run each update in the background and redirect output to log files
docker service update --image tenebrie/timelines-gatekeeper:${VERSION} --update-delay 60s timelines_gatekeeper > gatekeeper.log 2>&1 &
p1=$!
docker service update --image tenebrie/timelines-styx:${VERSION} --update-delay 60s timelines_styx > styx.log 2>&1 &
p2=$!
docker service update --image tenebrie/timelines-rhea:${VERSION} --update-delay 60s timelines_rhea > rhea.log 2>&1 &
p3=$!
docker service update --image tenebrie/timelines-calliope:${VERSION} --update-delay 60s timelines_calliope > calliope.log 2>&1 &
p4=$!

# Wait for all processes and capture exit codes
wait $p1; status_gatekeeper=$?
wait $p2; status_styx=$?
wait $p3; status_rhea=$?
wait $p4; status_calliope=$?

# Print each service's log with conditional colored headers based on success or failure
if [[ $status_gatekeeper -eq 0 ]]; then
    echo -e "\n\n${SUCCESS_COLOR}Logs for timelines_gatekeeper:${RESET_COLOR}"
else
    echo -e "\n\n${ERROR_COLOR}Logs for timelines_gatekeeper:${RESET_COLOR}"
fi
cat gatekeeper.log

if [[ $status_styx -eq 0 ]]; then
    echo -e "\n\n${SUCCESS_COLOR}Logs for timelines_styx:${RESET_COLOR}"
else
    echo -e "\n\n${ERROR_COLOR}Logs for timelines_styx:${RESET_COLOR}"
fi
cat styx.log

if [[ $status_rhea -eq 0 ]]; then
    echo -e "\n\n${SUCCESS_COLOR}Logs for timelines_rhea:${RESET_COLOR}"
else
    echo -e "\n\n${ERROR_COLOR}Logs for timelines_rhea:${RESET_COLOR}"
fi
cat rhea.log

if [[ $status_calliope -eq 0 ]]; then
    echo -e "\n\n${SUCCESS_COLOR}Logs for timelines_calliope:${RESET_COLOR}"
else
    echo -e "\n\n${ERROR_COLOR}Logs for timelines_calliope:${RESET_COLOR}"
fi
cat calliope.log

# Run prune regardless of status codes
echo -e "\n\nCleaning up after Docker..."
docker system prune -f

# Final check for success or failure with conditional message and exit code
if [[ $status_gatekeeper -eq 0 && $status_styx -eq 0 && $status_rhea -eq 0 && $status_calliope -eq 0 ]]; then
    echo -e "\n\n${SUCCESS_COLOR}All updates succeeded.${RESET_COLOR}"
else
    echo -e "\n\n${ERROR_COLOR}One or more updates failed. Check logs above for details.${RESET_COLOR}"
    exit 1
fi