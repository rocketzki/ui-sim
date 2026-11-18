#!/bin/bash

# Simple alias script for Python logs
# Usage: ./logs.sh [--follow|-f]

if [ "$1" = "--follow" ] || [ "$1" = "-f" ]; then
    ./view-python-logs.sh --follow
else
    ./view-python-logs.sh
fi
