update_env_variable() {
    local file="$1"
    local variable_name="$2"
    local new_value="$3"

    if [ ! -f "$file" ]; then
        touch "$file"
    fi

    # Check if variable exists (allow spaces around '=')
    if grep -qE "^$variable_name\s*=" "$file"; then
        # Update existing variable
        sed -i '' "s|^$variable_name\s*=.*|$variable_name=$new_value|" "$file"
    else
        # Add variable if it doesn't exist
        echo "$variable_name=$new_value" >> "$file"
    fi
    # Load the whole file into current shell
    if [ -f "$file" ]; then
        set -o allexport
        source "$file"
        set +o allexport
    fi
}

function select_option {
    local options=("$@")
    local selected=0
    local key
    while true; do
        # Print options
        for i in "${!options[@]}"; do
            if [ $i -eq $selected ]; then
               printf " \e[7m%s\e[0m\n" "${options[$i]}"  # Highlighted
            else
                printf " %s\n" "${options[$i]}"
            fi
        done

        # Read key
        read -rsn1 key
        if [[ $key == $'\x1b' ]]; then
            read -rsn2 key
            [[ $key == "[A" ]] && ((selected--))
            [[ $key == "[B" ]] && ((selected++))
        elif [[ $key == "" ]]; then
            break
        fi

        # Wrap around
        ((selected<0)) && selected=$((${#options[@]} - 1))
        ((selected>=${#options[@]})) && selected=0

        # Move cursor up to overwrite options
        printf "\033[${#options[@]}A"
    done

    return $selected
}
echo "Select the service to run using ↑ ↓ and Enter:"
options=("rest" "test")
select_option "${options[@]}"
choice=$?
update_env_variable ".env.${NODE_ENV}" "SERVICE" "${options[$choice]}"
if [[ "$NODE_ENV" == "production" ]]; then
    node scripts/run.js
else
    nodemon scripts/run.js
fi